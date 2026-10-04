import axios from 'axios';

// Mặc định gọi thẳng backend (cần cors() ở Express).
// Đặt NEXT_PUBLIC_API_URL="" để dùng proxy rewrites() trong next.config.ts.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

/** Lấy thông báo lỗi thân thiện từ lỗi axios (ưu tiên message do server trả về). */
export function getErrorMessage(err: unknown, fallback = 'Có lỗi xảy ra!'): string {
  if (axios.isAxiosError(err)) {
    const serverMsg = err.response?.data?.error;
    if (typeof serverMsg === 'string') return serverMsg;
    if (err.code === 'ERR_NETWORK') return 'Không thể kết nối server!';
  }
  return fallback;
}

export default api;
