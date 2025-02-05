import axios from 'axios';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  width: 100%;
  height: 25px;
  background-color: ${({ theme }) => theme.colors.forth};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  font-size: 12px;
  z-index: 1000;
  flex-shrink: 0;
  gap: 30px; /* 상태 간격 추가 */
`;

// 상태 표시 아이콘
const StatusIndicator = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  margin-left: 6px;
`;

// 상태 표시용 컨테이너 (각 상태를 개별 div로 분리)
const StatusBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px; /* 아이콘과 텍스트 간격 */
`;

const Footer = () => {
    const [isOnline, setIsOnline] = useState(false);
    const [isTradingActive, setIsTradingActive] = useState(false);

    // 서버 상태 체크 함수
    const checkServerStatus = async () => {
        try {
            const response = await axios.get('http://27.35.243.180:4000/api/status', { timeout: 2000 });
            setIsOnline(response.status === 200);
        } catch (error) {
            setIsOnline(false);
        }
    };

    // Flask 자동매매 상태 체크 함수
    const checkTradingStatus = async () => {
        try {
            const response = await axios.get('http://27.35.243.180:5000/trading-status', { timeout: 2000 });
            setIsTradingActive(response.data.running);
        } catch (error) {
            setIsTradingActive(false);
        }
    };

    useEffect(() => {
        checkServerStatus();
        checkTradingStatus();
        const interval = setInterval(() => {
            checkServerStatus();
            checkTradingStatus();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <FooterContainer>
            {/* Node 서버 상태 */}
            <StatusBox>
                <span>Node 서버</span>
                <StatusIndicator $color={isOnline ? '#77dd77' : '#ff6961'} />
            </StatusBox>

            {/* 자동매매 상태 */}
            <StatusBox>
                <span>자동매매</span>
                <StatusIndicator $color={isTradingActive ? '#77dd77' : '#ff6961'} />
            </StatusBox>
        </FooterContainer>
    );
};

export default Footer;
