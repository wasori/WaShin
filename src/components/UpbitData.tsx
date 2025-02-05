import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useUpbitData } from '../hooks/useUpbitData';

const marketNames: Record<string, string> = {
  'KRW-BTC': '비트코인',
  'KRW-ETH': '이더리움',
};

function UpbitData() {
  const { prices, priceHistory } = useUpbitData();
  const [selectedMarket, setSelectedMarket] = useState<string>('KRW-BTC');

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* 왼쪽: 그래프 */}
      <div style={{ width: '80%', height: '59%', padding: '5px' }}>
        <h3 style={{ color: 'white' }}>{marketNames[selectedMarket] || selectedMarket} 가격 그래프</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={
              priceHistory[selectedMarket]?.map((price, index) => ({ index, price })) || []
            }
          >
            <XAxis dataKey="index" hide />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip formatter={(value: number) => `${value.toLocaleString()} KRW`} />
            <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 오른쪽: 코인 리스트 */}
      <div style={{ width: '20%', height: '100%', borderLeft: '3px solid rgb(52, 58, 71)' }}>
        {Object.keys(prices).map((market) => (
          <div
            key={market}
            onClick={() => setSelectedMarket(market)}
            style={{
              color: 'white',
              padding: '10px',
              cursor: 'pointer',
              backgroundColor: selectedMarket === market ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              borderBottom: '1px solid rgb(52, 58, 71)',
            }}
          >
            <strong>{marketNames[market] || market}</strong>: {prices[market]?.trade_price?.toLocaleString() || '-'} KRW
          </div>
        ))}
      </div>
    </div>
  );
}

export default UpbitData;
