import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// 거래 내역 타입 정의
export interface Trade {
  uuid: string;
  type: '매수' | '매도';
  market: string;
  price: number;
  volume: number;
  amount: number;
  fee: number;
  total: number;
  timestamp: string;
}

// Reducer 함수 정의
const tradeHistoryReducer = (state: Trade[], action: { type: string; payload: Trade[] }) => {
  switch (action.type) {
    case 'UPDATE_HISTORY':
      return [...action.payload]; // 새로운 배열로 업데이트
    default:
      return state;
  }
};

export const useUpbitTradeHistory = () => {
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const prevTradeHistoryRef = useRef<Trade[]>([]);
  const [forceRender, setForceRender] = useState(false);

  const fetchTradeHistory = async () => {
    try {
      setLoading(true);
      console.log('fetchTradeHistory 실행됨');
  
      const response = await axios.get('http://27.35.243.180:4000/api/trade-history');
      console.log('백엔드 응답 데이터:', response.data);
  
      const formattedTrades: Trade[] = response.data.map((trade: any) => ({
        uuid: trade.uuid,
        type: trade.type,
        market: trade.market,
        price: parseFloat(trade.price),
        volume: parseFloat(trade.volume),
        amount: parseFloat(trade.amount),
        fee: parseFloat(trade.fee),
        total: parseFloat(trade.total),
        timestamp: trade.timestamp,
      }));
  
      console.log('변환된 거래 데이터:', formattedTrades);
  
      setTradeHistory(prev => {
        const newHistory = [...formattedTrades];
        if (JSON.stringify(prev) === JSON.stringify(newHistory)) {
          console.log('상태 변화 없음 → 업데이트 안 함');
          return prev;
        }
      
        console.log('새로운 거래 내역 반영');
        setForceRender(prev => !prev); //강제 리렌더링 트리거
        return newHistory;
      });
  
    } catch (error) {
      console.error('거래 내역 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeHistory(); //최초 실행

    // WebSocket 연결
    const ws = new WebSocket('ws://27.35.243.180:4000');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "tradeHistory") {
        console.log("WebSocket을 통해 거래 내역 업데이트 수신:", message.data);
        setTradeHistory(message.data);
      }
    };

    ws.onclose = () => console.log("WebSocket 연결 종료");
    return () => ws.close(); // 컴포넌트 언마운트 시 WebSocket 닫기
  }, []);

  return { tradeHistory, loading, fetchTradeHistory };
};
