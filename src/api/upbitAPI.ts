import axios from 'axios';

const API_BASE_URL = "http://27.35.243.180:4000";

export const fetchInitialData = async (market: string, count: number = 50) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/upbit/candles`, {
      params: { market, count },
    });

    return response.data
      .sort((a: any, b: any) => a.timestamp - b.timestamp) // 과거 -> 현재 정렬
      .map((candle: any) => ({
        timestamp: new Date(candle.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        open: candle.opening_price,
        high: candle.high_price,
        low: candle.low_price,
        close: candle.trade_price,
      }));
  } catch (error) {
    console.error(`🔥 초기 데이터(${market}) 가져오기 실패:`, error);
    return [];
  }
};
