import styled, { css, keyframes } from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTradeHistory } from '../redux/tradeHistorySlice';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

const blinkAnimation = keyframes`
  0%, 100% { background-color: transparent; }
  50% { background-color: rgba(255, 255, 255, 0.2); }
`;

const TradeHistoryContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Table = styled.table`
  width: auto;
  border-collapse: collapse;
  min-width: 1000px;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;

  @media (max-width: 768px) {
    width: 100vw; 
    min-width: 600px;
  }

  /* 스크롤바 스타일 수정 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 3px; 
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(20, 20, 20, 0.8); 
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2); 
  }

  &::-webkit-scrollbar-track {
    background: rgba(10, 10, 10, 0.7);
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(40, 40, 40, 0.9);
  }
`;

const TableHead = styled.thead`
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.third};
  z-index: 10;
  height: 30px;
`;

const ScrollableTbody = styled.tbody`
  max-height: 300px;
  overflow-y: auto;
  overflow-x: auto;
  width: 100%;

  
`;

const TableRow = styled.tr<{ $isNew?: boolean }>`
  display: table;
  width: 100%;
  table-layout: fixed;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  ${({ $isNew }) =>
    $isNew &&
    css`
      animation: ${blinkAnimation} 0.3s ease-in-out 3;
    `}
`;

const TableCell = styled.td`
  padding: 6px 8px;
  text-align: center;
  height: 25px;
  font-size: 14px;
  min-width: max-content;
  white-space: nowrap;
`;

const TradeType = styled.span<{ side: '매수' | '매도' }>`
  color: ${({ side }) => (side === '매수' ? '#77dd77' : '#ff6961')};
  font-weight: bold;
`;

const TradeHistoryFooter = styled.div`
  width: 100%;
  padding: 5px 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  border-top: 1px solid rgb(34, 34, 34);
  background-color: ${({ theme }) => theme.colors.third};
  position: sticky;
  bottom: 0;
  z-index: 10;
`;

function TradeHistorySection() {
  const dispatch = useAppDispatch();
  const tradeHistory = useAppSelector((state) => state.tradeHistory.tradeHistory);
  const loading = useAppSelector((state) => state.tradeHistory.loading);

  // 새로운 거래 ID 추적을 위한 상태
  const newTradeIdsRef = useRef<Set<string>>(new Set());
  const prevTradeHistoryRef = useRef<string[]>(tradeHistory.map(trade => trade.uuid));

  // 초기 로딩 시 거래 내역 가져오기
  useEffect(() => {
    dispatch(fetchTradeHistory());
  }, [dispatch]);

  // 새로운 거래 내역 감지 후 애니메이션 적용
  useEffect(() => {
    if (tradeHistory.length > 0) {
      const prevIds = prevTradeHistoryRef.current;
      const newTrades = tradeHistory
        .filter((trade) => !prevIds.includes(trade.uuid))
        .map((trade) => trade.uuid);

      if (newTrades.length > 0) {
        newTradeIdsRef.current = new Set(newTrades);

        // 애니메이션 후 초기화 (1초 뒤)
        setTimeout(() => {
          newTradeIdsRef.current.clear();
        }, 1000);
      }

      prevTradeHistoryRef.current = tradeHistory.map((trade) => trade.uuid);
    }
  }, [tradeHistory]);
  if (loading) return <TradeHistoryContainer>로딩 중...</TradeHistoryContainer>;

  return (
    <TradeHistoryContainer>
      <TableWrapper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>종류</TableCell>
            <TableCell>코인</TableCell>
            <TableCell>거래단가</TableCell>
            <TableCell>거래량</TableCell>
            <TableCell>거래금액</TableCell>
            <TableCell>수수료</TableCell>
            <TableCell>정산금액</TableCell>
            <TableCell>체결시간</TableCell>
          </TableRow>
        </TableHead>

        <ScrollableTbody>
          {tradeHistory.map((trade: any, index: number) => (
            <TableRow key={trade.uuid || index} $isNew={newTradeIdsRef.current.has(trade.uuid)}>
              <TableCell>
                <TradeType side={trade.type}>{trade.type}</TradeType>
              </TableCell>
              <TableCell>{trade.market.replace('KRW-', '')}</TableCell>
              <TableCell>{trade.price.toLocaleString()} KRW</TableCell>
              <TableCell>{trade.volume.toLocaleString()} 개</TableCell>
              <TableCell>{trade.amount.toLocaleString()} KRW</TableCell>
              <TableCell>{trade.fee.toLocaleString()} KRW</TableCell>
              <TableCell>{trade.total.toLocaleString()} KRW</TableCell>
              <TableCell>{new Date(trade.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </ScrollableTbody>
      </Table>
      </TableWrapper>

      <TradeHistoryFooter>
        총 {tradeHistory.length} 건의 거래 기록
      </TradeHistoryFooter>
    </TradeHistoryContainer>
  );
}

export default TradeHistorySection;
