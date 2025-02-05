import styled from 'styled-components';
import '../App.css';
import { useUpbitAssets } from '../hooks/useUpbitAssets';
import AssetGraph from './AssetGraph';

const RightSection = styled.div`
  width: 20%;
  height: 100%;
  border-left: ${({ theme }) => theme.layout.borderWidth} solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  flex-direction: column;
  padding: 10px;

  @media (max-width: 768px) {
    width: 50%; 
    height: auto;
    flex-direction: column; 
  }
`;

/* 개별 코인 행 스타일 */
const CoinRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  margin-bottom: 5px;
`;

/* 코인 이름 (왼쪽 정렬) */
const CoinName = styled.div`
  flex: 1;
  text-align: left;
  font-weight: bold;
  color: white;
`;

/* 코인 가격 (오른쪽 정렬) */
const CoinPrice = styled.div`
  flex: 1;
  text-align: right;
  color: white;
`;

/* 변동률 스타일 */
const ChangeRate = styled.div<{ rate: number }>`
  flex: 1;
  text-align: right;
  font-size: 14px;
  color: ${({ rate }) => (rate > 0 ? '#77dd77' : rate < 0 ? '#ff6961' : '#ccc')};
`;

// 코인 이름 변환 테이블
const marketNames: Record<string, string> = {
  'KRW-BTC': '비트코인',
  'KRW-ETH': '이더리움',
  'KRW-XRP': '리플',
  'KRW-DOGE': '도지',
  'KRW-SUI': '수이',
  'KRW-ENS': '이더네임서비스',
  'KRW-SOL': '솔라나',
};

// 오른쪽 하단 컨테이너 (자산 정보 + 보유 코인 비율)
const BottomSection = styled.div`
  width: 100%;
  border-top: 2px solid ${({ theme }) => theme.colors.secondary};
  color: white;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

// 구분선 스타일
const Divider = styled.div`
  width: 100%;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.secondary};
  margin: 10px 0;
`;

// 자산 정보 컨테이너 (40%)
const AssetInfo = styled.div`
  flex: 3;
  padding: 10px;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

// 각 자산 정보 항목
const AssetRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
`;

// 그래프 컨테이너 (60%)
const GraphContainer = styled.div`
  flex: 6;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* 햄버거 메뉴 버튼 */
const MenuButton = styled.button`
  position: fixed;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  z-index: 101; /* 패널보다 위에 */
`;

/* 닫기 버튼 */
const CloseButton = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  margin-bottom: 10px;
`;

function RightSectionContent({ coinList, prices, priceChanges }: any) {
  const { assetsData, assetsGraph, loading } = useUpbitAssets();

  return (
    <RightSection>
      {coinList.map((market: string) => (
        <CoinRow key={market} className={`price-box ${priceChanges[market] || 'neutral'}`}>
          <CoinName>{marketNames[market] || market}</CoinName>
          <CoinPrice>{prices[market]?.trade_price?.toLocaleString() || '-'}</CoinPrice>
          <ChangeRate rate={prices[market]?.changeRate}>
            {prices[market]?.changeRate.toFixed(2)}%
          </ChangeRate>
        </CoinRow>
      ))}

      <BottomSection>
        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <>
            <AssetInfo>
              <AssetRow>
                <span>총 보유자산</span>
                <span>{(Number(assetsData?.totalEvaluation ?? 0)).toLocaleString()} KRW</span>
              </AssetRow>
              <AssetRow>
                <span>보유 KRW</span>
                <span>{(Number(assetsData?.krwBalance ?? 0)).toLocaleString()} KRW</span>
              </AssetRow>
              <AssetRow>
                <span>총 매수</span>
                <span>{(Number(assetsData?.totalBuy ?? 0)).toLocaleString()} KRW</span>
              </AssetRow>
              <AssetRow>
                <span>총 평가 수익률</span>
                <span style={{ color: (assetsData?.profitRate ?? 0) >= 0 ? '#77dd77' : '#ff6961' }}>
                  {(Number(assetsData?.profitRate ?? 0)).toFixed(2)}%
                </span>
              </AssetRow>
            </AssetInfo>

            <Divider />

            <GraphContainer>
              <AssetGraph assets={assetsGraph} />
            </GraphContainer>
          </>
        )}
      </BottomSection>
    </RightSection>
  );
}

export default RightSectionContent;
