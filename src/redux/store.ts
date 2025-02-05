import { configureStore } from '@reduxjs/toolkit';
import tradeHistoryReducer from './tradeHistorySlice';

export const store = configureStore({
  reducer: {
    tradeHistory: tradeHistoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;