import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { startTrading, stopTrading, getTradingStatus } from "../api/tradingApi";
import { AliwangwangOutlined } from "@ant-design/icons";

const HeaderDiv = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between; /* 양쪽 끝 정렬 */
  padding: 10px 20px;
  border-bottom: ${({ theme }) => theme.layout.borderWidth} solid ${({ theme }) => theme.colors.secondary};
  background-color: ${({ theme }) => theme.colors.primary};
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.div`
  font-size: 26px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button<{ $isRunning?: boolean }>`
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  background-color: ${({ $isRunning }) => ($isRunning ? "red" : "green")};
  color: white;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ $isRunning }) => ($isRunning ? "#cc0000" : "#006400")};
  }

  &:disabled {
    background-color: gray;
    cursor: not-allowed;
  }
`;

const StatusText = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
  font-size: 14px;
  margin-left: 10px;
`;

function HeaderSection() {
  const [status, setStatus] = useState({ running: false });

  // 자동매매 상태 확인
  const fetchStatus = async () => {
    const data = await getTradingStatus();
    setStatus(data);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // 자동매매 시작 (입력 없이 백엔드에서 지정된 코인으로 실행)
  const handleStart = async () => {
    const result = await startTrading();
    alert(result.message || result.error);
    fetchStatus();
  };

  // 자동매매 종료
  const handleStop = async () => {
    await stopTrading();
    alert("자동매매가 종료되었습니다.");
    fetchStatus();
  };

  return (
    <HeaderDiv>
      {/* 왼쪽: 로고 & 제목 */}
      <TitleContainer>
        <AliwangwangOutlined style={{ fontSize: "30px", color: "#fff", marginRight: "7px" }} />
        <Title>WaShin</Title>
      </TitleContainer>

      {/* 오른쪽: 자동매매 버튼 & 상태 표시 */}
      <ButtonGroup>
        <Button onClick={handleStart} disabled={status.running}>
          자동매매 시작
        </Button>
        <Button onClick={handleStop} $isRunning={true} disabled={!status.running}>
          자동매매 종료
        </Button>
        {status.running && <StatusText>자동매매 실행 중</StatusText>}
      </ButtonGroup>
    </HeaderDiv>
  );
}

export default HeaderSection;
