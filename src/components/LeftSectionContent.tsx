import styled, { css, keyframes } from 'styled-components';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useEffect, useState } from 'react';
import { useUpbitAssets } from '../hooks/useUpbitAssets';
import axios from 'axios';
import { useUpbitTradeHistory } from '../hooks/useUpbitTradeHistory';
import { useAppDispatch } from '../redux/hooks';
import { fetchTradeHistory } from '../redux/tradeHistorySlice';

const API_BASE_URL = "http://27.35.243.180:4000";

const LeftSection = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
  overflow-y: auto;
  max-width: 100%;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ChartWrapper = styled.div<{ $isTrading: boolean }>`
  flex: 1 1 calc(25% - 10px);
  max-width: 335px;
  min-width: 200px;
  height: 230px;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  padding: 10px;
  margin: 5px;
  background-color: ${({ theme }) => theme.colors.primary};
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: border-color 0.3s ease-in-out;

  /*거래 진행 중이면 보라색 테두리에 빛나는 효과 */
  ${({ $isTrading }) =>
    $isTrading &&
    css`
      animation: ${glowAnimation} 2s infinite ease-in-out;
    `}
`;

const glowAnimation = keyframes`
  0% { border-color: ${({ theme }) => theme.colors.secondary}; box-shadow: 0px 0px 5px rgba(95, 75, 182, 0.4); }
  50% { border-color: #5f4bb6; box-shadow: 0px 0px 15px rgba(95, 75, 182, 1); }
  100% { border-color: ${({ theme }) => theme.colors.secondary}; box-shadow: 0px 0px 5px rgba(95, 75, 182, 0.4); }
`;

const ChartTitle = styled.h3`
  color: white;
  margin-bottom: 10px;
  text-align: center;
  font-size: 14px;
`;

const ChartContent = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const ChartArea = styled.div`
  width: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 10px;
`;

const InfoArea = styled.div`
  width: 30%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-left: 1px solid ${({ theme }) => theme.colors.secondary};
  padding-left: 10px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  gap: 6px;
`;

const BuyButton = styled.button`
  width: 80%;
  padding: 5px;
  background-color: transparent; 
  color: white;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  height: 50px;
  &:hover {
    background-color:rgba(119, 221, 119, 0.85); 
    color: black; 
  }
`;

const SellButton = styled.button`
  width: 80%;
  padding: 5px;
  background-color: transparent; 
  color: white;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  height: 50px;
  &:hover {
    background-color: #ff6961; 
    color: black;
  }
`;

const InputField = styled.input`
  width: 60%;
  padding: 4px;
  font-size: 12px;
  text-align: center;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 5px;
  background-color: transparent;
  color: white;
  outline: none;
  margin-top: 5px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
  }
`;

const calculateBollingerBands = (
  data: { close: number; timestamp: number }[], 
  period: number = 30,
  stdDevMultiplier: number = 2.5
) => {
  if (data.length < period) return [];

  return data.map((_, index, arr) => {
    if (index < period - 1) return null;

    const slice = arr.slice(index - period + 1, index + 1);
    const prices: number[] = slice.map((d) => d.close); 
    const sma: number = prices.reduce((sum, p) => sum + p, 0) / period;
    const variance: number = prices.reduce((sum, p) => sum + Math.pow(p - sma, 2), 0) / period;
    const stdDev: number = Math.sqrt(variance); 
    return {
      ...arr[index],
      sma, // 기준선
      upper: sma + stdDevMultiplier * stdDev, // 상한선
      lower: sma - stdDevMultiplier * stdDev, // 하한선
    };
  }).filter(Boolean);
};

const orderMarket = async (
  market: string,
  side: 'bid' | 'ask',
  tradeAmount: number,
  dispatch: any //
) => {
  console.log("주문 요청 실행");
  try {
    if (side === 'bid' && tradeAmount < 5000) {
      alert('최소 주문 금액은 5,000원 이상이어야 합니다.');
      return;
    }

    await axios.post(`${API_BASE_URL}/api/order`, {
      market,
      side,
      price: side === 'bid' ? tradeAmount : undefined,
      volume: side === 'ask' ? undefined : tradeAmount,
    });

    alert(`${side === 'bid' ? '매수' : '매도'} 주문 성공!`);

    // Redux 상태 즉시 업데이트
    dispatch(fetchTradeHistory());

  } catch (error: any) {
    alert(`주문 실패!\n${error.response?.data?.error}`);
    console.error('주문 오류:', error.response?.data || error.message);
  }
};

function LeftSectionContent({
  coinList,
  priceHistories,
}: {
  coinList: string[];
  priceHistories: Record<string, any[]>;
}) {
  const { getAvgBuyPrice } = useUpbitAssets();
  const dispatch = useAppDispatch();

  return (
    <LeftSection>
      {coinList.map((market) => {
        const priceHistory = priceHistories[market] || [];
        const chartData = priceHistory.map((item) => ({
          time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          price: item.close,
          high: item.high,
          low: item.low,
        }));

        const [prevPrice, setPrevPrice] = useState<number | null>(null);
        const [priceChangeState, setPriceChangeState] = useState<'up' | 'down' | null>(null);
        const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : null;
        const [tradeAmount, setTradeAmount] = useState(5000); // 기본값 5000
        const bollingerData = calculateBollingerBands(priceHistory);
        
        // 현재 코인의 평균 단가 가져오기
        const avgBuyPrice = getAvgBuyPrice(market);

        // 변동률 계산 (현재 가격과 평균 단가 비교)
        let priceChangePercent = null;
        if (avgBuyPrice && currentPrice) {
          priceChangePercent = ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100;
        }

        const tradeStatus = avgBuyPrice ? '거래 진행 중' : '탐색 중';

        // 가격 변경 감지 후 상태 업데이트
        useEffect(() => {
          if (currentPrice !== null) {
            if (prevPrice !== null) {
              if (currentPrice > prevPrice) setPriceChangeState('up');
              else if (currentPrice < prevPrice) setPriceChangeState('down');
            }
            setPrevPrice(currentPrice);

            // 3초 후 삼각형 숨기기
            const timer = setTimeout(() => {
              setPriceChangeState(null);
            }, 3000);

            return () => clearTimeout(timer);
          }
        }, [currentPrice]);

        return (
          <ChartWrapper key={market} $isTrading={tradeStatus === '거래 진행 중'}>
            <ChartTitle>{market}</ChartTitle>
            <ChartContent>
              <ChartArea>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bollingerData}>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#000',
                        borderRadius: '5px',
                        padding: '4px 8px',
                      }}
                      itemStyle={{
                        color: '#ccc',
                        fontSize: '12px',
                      }}
                      labelStyle={{
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="sma" stroke="rgba(173, 173, 173, 0.7)" strokeWidth={2} dot={false} />
                    {/* 상한선 */}
                    <Line type="monotone" dataKey="upper" stroke="rgba(216, 216, 216, 0.7)" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                    {/* 하한선 */}
                    <Line type="monotone" dataKey="lower" stroke="rgba(218, 218, 218, 0.7)" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                    {/*  실제 가격 그래프 */}
                    <Line type="monotone" dataKey="close" stroke="#8884d8" strokeWidth={2} dot={{ r: 0 }} />
                    {/* 평균 단가 (수평선) 추가 */}
                    {avgBuyPrice && <ReferenceLine y={avgBuyPrice} stroke="gold" strokeWidth={1} />}
                  </LineChart>
                </ResponsiveContainer>
              </ChartArea>

              <InfoArea>
                <BuyButton onClick={() => orderMarket(market, 'bid', tradeAmount, dispatch)}>BUY</BuyButton>
                <SellButton onClick={() => orderMarket(market, 'ask', tradeAmount, dispatch)}>SELL</SellButton>
                <span>{tradeStatus}</span>
                {priceChangePercent !== null && (
                  <span
                    style={{
                      color: priceChangePercent > 0 ? '#77dd77' : '#ff6961',
                      fontWeight: 'bold',
                    }}
                  >
                    {priceChangePercent > 0 ? ` + ${priceChangePercent.toFixed(2)}%` : ` ${priceChangePercent.toFixed(2)}%`}
                  </span>
                )}
                <InputField
                  type="text"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Number(e.target.value))}
                  placeholder="금액 입력"
                />
              </InfoArea>
            </ChartContent>
          </ChartWrapper>
        );
      })}
    </LeftSection>
  );
}

export default LeftSectionContent;

