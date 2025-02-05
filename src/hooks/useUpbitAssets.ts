import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// 자산 데이터 타입 정의
interface Asset {
    currency: string;
    balance: number;
    avgBuyPrice: number;
    totalValue: number;
}

interface AssetData {
    krwBalance: number;
    totalBuy: number;
    totalEvaluation: number;
    profitRate: number;
    assets: Asset[];
}

export const useUpbitAssets = () => {
    const [assetsData, setAssetsData] = useState<AssetData | null>(null); // 총 보유자산 관련 상태
    const [assetsGraph, setAssetsGraph] = useState<Asset[]>([]); // 보유 코인 그래프 관련 상태
    const [loading, setLoading] = useState(true);
    
    const prevAssetKeys = useRef<Set<string>>(new Set()); // 이전 보유 코인 목록 저장
    const prevTotalEvaluation = useRef<number | null>(null); // 이전 총 평가금액 저장

    const fetchAssets = async () => {
        try {
            const response = await axios.get('http://27.35.243.180:4000/api/assets');
            const newData: AssetData = response.data;

            // 현재 보유 코인 목록 (코인 종류만 추출)
            const newAssetKeys = new Set(newData.assets.map(asset => asset.currency));
            const newTotalEvaluation = newData.totalEvaluation;

            // 보유 코인 종류(개수)가 변했을 때 → 그래프 업데이트
            if (JSON.stringify(Array.from(prevAssetKeys.current)) !== JSON.stringify(Array.from(newAssetKeys))) {
                prevAssetKeys.current = newAssetKeys;
                setAssetsGraph(newData.assets); // 보유 코인 정보만 업데이트
            }

            // 총 평가금액이 변했을 때 → 자산 정보 업데이트
            if (prevTotalEvaluation.current !== newTotalEvaluation) {
                prevTotalEvaluation.current = newTotalEvaluation;
                setAssetsData(newData);
            }
        } catch (error) {
            console.error('자산 정보 불러오기 실패:', error);
        } finally {
            if (loading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();

        const interval = setInterval(fetchAssets, 5000); // 5초마다 체크
        return () => clearInterval(interval);
    }, []);

    // 평균 단가 가져오기
    const getAvgBuyPrice = (market: string) => {
        const asset = assetsGraph.find((a) => `KRW-${a.currency}` === market);
        return asset ? asset.avgBuyPrice : null;
    };

    return { assetsData, assetsGraph, loading, getAvgBuyPrice };
};
