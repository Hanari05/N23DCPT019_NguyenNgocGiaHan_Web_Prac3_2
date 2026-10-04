'use client';

import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // useState để mỗi phiên trình duyệt chỉ tạo QueryClient đúng 1 lần
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Dữ liệu được coi là "tươi" trong 30s: chuyển trang qua lại dùng cache,
            // không gọi lại API ngay. Sau 30s sẽ tự refetch khi cần.
            staleTime: 30_000,
            // Không retry lỗi 4xx (vd 404 không tìm thấy) vì thử lại cũng vô ích
            retry: (failureCount, error) => {
              if (axios.isAxiosError(error) && error.response && error.response.status < 500) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
