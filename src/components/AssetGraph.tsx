import React, { useEffect, useRef } from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import styled from 'styled-components';

// Chart.js 요소 등록
Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const GraphContainer = styled.div`
  flex: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

function AssetGraph({ assets }: { assets: any[] }) {
  const chartRef = useRef<any>(null);
  const chartDataRef = useRef<any>(null);

  if (!assets || assets.length === 0) {
    return <p style={{ textAlign: 'center', color: 'white' }}>보유 중인 코인이 없습니다.</p>;
  }

  // 차트 데이터 변환
  const chartData = {
    labels: assets.map((a) => a.currency),
    datasets: [
      {
        label: '보유 코인 비율',
        data: assets.map((a) => a.totalValue),
        backgroundColor: 'rgba(54, 162, 235, 0.2)', 
        borderColor: 'rgba(54, 162, 235, 1)', 
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
      },
    ],
  };

  // 차트 데이터 업데이트 (깜빡임 방지)
  useEffect(() => {
    if (chartRef.current && chartDataRef.current) {
      chartDataRef.current.labels = chartData.labels;
      chartDataRef.current.datasets[0].data = chartData.datasets[0].data;
      chartRef.current.update();
    }
  }, [assets]);

  return (
    <GraphContainer>
      <Radar
        ref={chartRef}
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              beginAtZero: true,
              ticks: {
                display: false,
                color: 'white',
                backdropColor: 'transparent',
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.2)', // 그리드 색상 변경
              },
              angleLines: {
                color: 'rgba(255, 255, 255, 0.2)', // 각도선 색상 변경
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                color: 'white',
              },
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  return `${label}: ${value.toLocaleString()} KRW`;
                },
              },
            },
          },
        }}
      />
    </GraphContainer>
  );
}

export default AssetGraph;
