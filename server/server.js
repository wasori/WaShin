require('dotenv').config();


const WebSocket = require('ws');
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const querystring = require('querystring');

const app = express();
const PORT = 4000;

// CORS 설정
app.use(cors({ origin: "*" }));  // 모든 요청 허용
app.use(express.json());

// 업비트 API 키
const ACCESS_KEY = process.env.UPBIT_ACCESS_KEY;
const SECRET_KEY = process.env.UPBIT_SECRET_KEY;

// WebSocket 서버 추가
const wss = new WebSocket.Server({ noServer: true });


// WebSocket 연결 관리
wss.on('connection', (ws) => {
    console.log('클라이언트 WebSocket 연결됨');

    ws.on('message', (message) => {
        console.log('메시지 수신:', message);
    });

    ws.on('close', () => {
        console.log('WebSocket 연결 종료');
    });
});


// JWT 토큰 생성 함수
const generateJwtToken = (body) => {
    const query = querystring.stringify(body); // JSON → 쿼리스트링 변환
    // console.log("Query String:", query); // 디버깅 로그 

    const queryHash = crypto.createHash('sha512').update(query).digest('hex'); // 해시 생성
    // console.log("Query Hash:", queryHash); // 디버깅 로그 

    const payload = {
        access_key: ACCESS_KEY,
        nonce: crypto.randomBytes(16).toString('hex'),
        query_hash: queryHash,
        query_hash_alg: 'SHA512',
    };

    return jwt.sign(payload, SECRET_KEY, { algorithm: 'HS256' });
};

// 보유 KRW & 코인 수량 조회 함수
const getAccountBalance = async () => {
    try {
        const token = generateJwtToken('');
        const response = await axios.get('https://api.upbit.com/v1/accounts', {
            headers: { Authorization: `Bearer ${token}` },
        });

        const balances = response.data.map((asset) => ({
            currency: asset.currency,
            balance: parseFloat(asset.balance),
        }));

        return {
            krwBalance: balances.find((b) => b.currency === 'KRW')?.balance || 0,
            balances,
        };
    } catch (error) {
        console.error('보유 자산 조회 실패:', error.response?.data || error.message);
        throw new Error('자산 정보를 가져오지 못했습니다.');
    }
};



// 내 체결 내역 (거래 내역) 가져오기 API
app.get('/api/trade-history', async (req, res) => {
    try {
        const queryObj = { 
            states: ['done'], // 체결 완료된 주문만 가져오기
            limit: 50 // 최대 50개 데이터 가져오기
        }; 
        const queryStr = querystring.stringify(queryObj); 
        const token = generateJwtToken(queryObj);

        const response = await axios.get(`https://api.upbit.com/v1/orders/closed?${queryStr}`, { 
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data || response.data.length === 0) {
            return res.json([]);
        }

        // console.log(" API 응답 데이터:", response.data);

        const formattedTrades = response.data.map((trade) => {
            const executedFunds = parseFloat(trade.executed_funds);
            const executedVolume = parseFloat(trade.executed_volume);
            const paidFee = parseFloat(trade.paid_fee);
            const isBuy = trade.side === 'bid';

            return {
                uuid: trade.uuid,
                type: isBuy ? '매수' : '매도',
                market: trade.market,
                price:(executedFunds / executedVolume).toFixed(2),
                volume: executedVolume.toFixed(6), // 거래량
                amount: isBuy ? trade.price : executedFunds.toFixed(0), // 거래금액 → 소수점 제거
                fee: paidFee.toFixed(2), // 수수료
                total: Math.floor(isBuy 
                    ? executedFunds + paidFee  // 매수는 총 지불금액
                    : executedFunds - paidFee), // 매도는 수수료 제외
                timestamp: trade.created_at, // 체결시간
            };
        });

        res.json(formattedTrades);

        // WebSocket을 통해 거래 내역 전송
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "tradeHistory", data: formattedTrades }));
            }
        });

    } catch (error) {
        console.error('거래 내역 가져오기 실패:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch trade history', details: error.response?.data || error.message });
    }
});


// 내 자산 정보 가져오기 (보유 KRW 및 코인)
app.get('/api/assets', async (req, res) => {
    try {
        const token = generateJwtToken('');
        const response = await axios.get(`https://api.upbit.com/v1/accounts`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // console.log("" API 응답 데이터:", response.data);

        // 업비트 현재 시세 조회 (보유 코인들의 최신 가격 가져오기)
        const markets = response.data
            .filter((asset) => asset.currency !== 'KRW' && asset.currency !== 'XCORE' && asset.currency !== 'PURSE') // XCORE & PURSE 제외
            .map((asset) => `KRW-${asset.currency}`);

        const marketPricesResponse = await axios.get(`https://api.upbit.com/v1/ticker?markets=${markets.join(',')}`);
        const marketPrices = marketPricesResponse.data.reduce((acc, market) => {
            acc[market.market.replace('KRW-', '')] = parseFloat(market.trade_price);
            return acc;
        }, {});

        // 데이터 변환
        const assets = response.data
            .filter((asset) => asset.currency !== 'KRW' && asset.currency !== 'XCORE' && asset.currency !== 'PURSE') // XCORE & PURSE 제외
            .map((asset) => ({
                currency: asset.currency,
                balance: parseFloat(asset.balance),
                avgBuyPrice: parseFloat(asset.avg_buy_price) || 0,
                totalValue: (parseFloat(asset.balance) * (marketPrices[asset.currency] || 0)), // 최신 가격 반영
            }));

        // KRW & 총 평가 금액 계산
        const krwBalance = response.data.find((a) => a.currency === 'KRW')?.balance || 0;
        const totalEvaluation = assets.reduce((acc, asset) => acc + asset.totalValue, 0);
        const totalBuy = assets.reduce((acc, asset) => acc + asset.avgBuyPrice * asset.balance, 0);
        const profitRate = totalBuy > 0 ? ((totalEvaluation - totalBuy) / totalBuy) * 100 : 0;

        res.json({
            krwBalance: Math.floor(krwBalance), // 소수점 제거
            totalBuy: Math.floor(totalBuy),
            totalEvaluation: Math.floor(totalEvaluation),
            profitRate: profitRate.toFixed(2),
            assets, // KRW 제외하고 반환
        });
    } catch (error) {
        console.error('자산 정보 가져오기 실패:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch asset data', details: error.response?.data || error.message });
    }
});

// 시장가 주문 실행 API (매수/매도)
app.post('/api/order', async (req, res) => {
    try {
        const { market, side, price } = req.body;

        if (!market || !side) {
            return res.status(400).json({ error: '필수 주문 정보를 입력하세요.' });
        }

        const { krwBalance, balances } = await getAccountBalance();

        // 최소 주문 금액 체크 (5,000원 이상)
        if (side === 'bid' && price < 5000) {
            return res.status(400).json({ error: '최소 주문 금액은 5,000원 이상이어야 합니다.' });
        }

        // 보유 KRW 확인하여 주문 가능 여부 체크
        if (side === 'bid' && price > krwBalance) {
            return res.status(400).json({ error: `보유금액보다 주문금액이 큽니다.` });
        }

        let volume;
        if (side === 'ask') { // 매도 주문인 경우
            const coin = balances.find((b) => b.currency === market.replace('KRW-', ''));
            if (!coin || coin.balance <= 0) {
                return res.status(400).json({ error: '보유한 코인이 없습니다.' });
            }
            volume = coin.balance.toString(); // 전량 매도
        }

        const orderData = {
            market,
            side,
            volume: side === 'ask' ? volume : undefined, // 매도는 수량 필수
            price: side === 'bid' ? price : undefined, // 매수는 금액 필수
            ord_type: side === 'ask' ? 'market' : 'price', // 매도는 market, 매수는 price
        };

        // console.log("Order Data:", orderData); // 디버깅 로그 추가

        const token = generateJwtToken(orderData);
        const response = await axios.post('https://api.upbit.com/v1/orders', querystring.stringify(orderData), {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        // console.log('주문 성공:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('🔥 주문 실패:', error.response?.data || error.message);
        res.status(500).json({ error: '주문 실패', details: error.response?.data || error.message });
    }
});

// Upbit API 프록시 엔드포인트
app.get('/api/upbit/candles', async (req, res) => {
    try {
        const { market, count } = req.query;
        const response = await axios.get(`https://api.upbit.com/v1/candles/minutes/15`, {
            params: { market, count },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Upbit API 요청 실패:', error.message);
        res.status(500).json({ error: 'Upbit API 요청 실패', details: error.message });
    }
});


app.get('/api/status', (req, res) => {
    res.json({ status: 'running' });
});

// HTTP 서버와 WebSocket 서버 통합
const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Node 서버 실행 중: http://27.35.243.180:${PORT}`);
});

// WebSocket 핸들링
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
