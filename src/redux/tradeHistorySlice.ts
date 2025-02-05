import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = "http://27.35.243.180:4000";

// 비동기 액션: 거래 내역 가져오기
export const fetchTradeHistory = createAsyncThunk(
  'tradeHistory/fetchTradeHistory',
  async () => {
    const response = await axios.get(`${API_BASE_URL}/api/trade-history`);
    return response.data;
  }
);

const tradeHistorySlice = createSlice({
  name: 'tradeHistory',
  initialState: {
    tradeHistory: [] as any[], 
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTradeHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTradeHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.tradeHistory = action.payload;
      })
      .addCase(fetchTradeHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
  },
});

export default tradeHistorySlice.reducer;
