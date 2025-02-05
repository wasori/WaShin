import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import HeaderSection from './components/HeaderSection';
import LeftSectionContent from './components/LeftSectionContent';
import RightSectionContent from './components/RightSectionContent';
import TradeHistorySection from './components/TradeHistorySection';
import Footer from './components/Footer'; 
import theme from './styles/theme';
import GlobalStyles from './styles/GlobalStyle';
import { useUpbitData, coinList } from './hooks/useUpbitData';

import './App.css';

function App() {
  const { prices, priceHistory, tradeHistory, loading } = useUpbitData();
  const [priceChanges, setPriceChanges] = useState<Record<string, 'up' | 'down' | 'neutral'>>({});
  const prevPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    const newPriceChanges: Record<string, 'up' | 'down' | 'neutral'> = {};

    Object.keys(prices).forEach((market) => {
      const newPrice = prices[market]?.trade_price || 0;
      const oldPrice = prevPrices.current[market] || 0;

      if (newPrice > oldPrice) {
        newPriceChanges[market] = 'up';
      } else if (newPrice < oldPrice) {
        newPriceChanges[market] = 'down';
      } else {
        newPriceChanges[market] = 'neutral';
      }

      prevPrices.current[market] = newPrice;
    });

    setPriceChanges(newPriceChanges);
  }, [prices]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <HeaderSection />

      {/* 로딩 중이면 스피너 표시 */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div style={{ display: 'flex', height: 'calc(100vh - 89px)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '80%', overflow: 'hidden' }}>
            <div style={{ flex: 2, width: '97.5%', overflow: 'hidden' , padding: '20px'}}>
              <LeftSectionContent coinList={coinList} priceHistories={priceHistory} />
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <TradeHistorySection />
            </div>
          </div>
          <RightSectionContent coinList={coinList} prices={prices} priceChanges={priceChanges} />
        </div>
      )}
      <Footer /> 
    </ThemeProvider>
  );
}

export default App;
