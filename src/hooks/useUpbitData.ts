import { useState, useEffect } from 'react';
import { fetchInitialData } from '../api/upbitAPI';

// 자동매매코인목록
export const coinList = ['KRW-DOGE', 'KRW-BTC', 'KRW-ETH', 'KRW-XRP', 'KRW-SUI', 'KRW-ENS', 'KRW-SOL'];

export const useUpbitData = () => {
  const [prices, setPrices] = useState<Record<string, { market: string; trade_price: number; changeRate: number }>>(
    Object.fromEntries(coinList.map((coin) => [coin, { market: coin, trade_price: 0, changeRate: 0 }]))
  );

  const [priceHistory, setPriceHistory] = useState<Record<string, any[]>>(
    Object.fromEntries(coinList.map((coin) => [coin, []]))
  );

  const [tradeHistory, setTradeHistory] = useState<{ market: string; trade_price: number; trade_volume: number; timestamp: number }[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialHistory = async () => {
      setLoading(true);
      const histories = await Promise.all(coinList.map((coin) => fetchInitialData(coin)));
      const historyObj = Object.fromEntries(coinList.map((coin, idx) => [coin, histories[idx] || []]));

      setPriceHistory(historyObj);
      setLoading(false);
    };

    fetchInitialHistory();
  }, []);

  useEffect(() => {
    const ws = new WebSocket('wss://api.upbit.com/websocket/v1');

    ws.onopen = () => {
      ws.send(
        JSON.stringify([
          { ticket: 'unique_ticket' },
          { type: 'ticker', codes: coinList },
          { type: 'trade', codes: coinList },
        ])
      );
    };

    ws.onmessage = (event) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = JSON.parse(reader.result as string);
        const market = data.code;
        const newPrice = data.trade_price;
        const timestamp = data.timestamp;
        const changeRate = data.signed_change_rate * 100;

        if (data.type === 'ticker') {
          setPrices((prevPrices) => ({
            ...prevPrices,
            [market]: { market, trade_price: newPrice, changeRate },
          }));

          setPriceHistory((prevHistory) => {
            const currentHistory = prevHistory[market] || [];
            const newTimestamp = Math.floor(timestamp / 300000) * 300000;

            const lastCandleIndex = currentHistory.findIndex((c) => c.timestamp === newTimestamp);

            if (lastCandleIndex === -1) {
              return {
                ...prevHistory,
                [market]: [
                  ...currentHistory,
                  { timestamp: newTimestamp, open: newPrice, high: newPrice, low: newPrice, close: newPrice },
                ].slice(-50),
              };
            }

            return {
              ...prevHistory,
              [market]: currentHistory.map((c, index) =>
                index === lastCandleIndex
                  ? {
                      ...c,
                      high: Math.max(c.high, newPrice),
                      low: Math.min(c.low, newPrice),
                      close: newPrice,
                    }
                  : c
              ),
            };
          });
        }

        if (data.type === 'trade') {
          setTradeHistory((prevTrades) => [
            { market, trade_price: newPrice, trade_volume: data.trade_volume, timestamp },
            ...prevTrades.slice(0, 9),
          ]);
        }
      };
      reader.readAsText(event.data);
    };

    return () => ws.close();
  }, []);

  return { prices, priceHistory, tradeHistory, loading };
};
