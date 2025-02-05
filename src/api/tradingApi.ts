import axios from "axios";

const API_BASE_URL = "http://27.35.243.180:5000";

export const startTrading = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/start-trading`);
    return response.data;
  } catch (error: any) {
    return { error: error.response?.data?.error || "자동매매 시작 실패" };
  }
};

export const stopTrading = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/stop-trading`);
    return response.data;
  } catch (error: any) {
    return { error: error.response?.data?.error || "자동매매 종료 실패" };
  }
};

export const getTradingStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trading-status`);
    return response.data;
  } catch (error: any) {
    return { running: false };
  }
};


