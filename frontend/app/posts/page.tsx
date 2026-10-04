'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import PostCard from '@/components/PostCard';
import PostForm from '@/components/PostForm';
import { usePosts } from '@/lib/queries';

export default function PostsPage() {
  const { data: posts, isLoading, isError, refetch } = usePosts();

  // id cố định -> khi polling lỗi liên tục vẫn chỉ hiện đúng 1 toast
  useEffect(() => {
    if (isError) toast.error('Không thể kết nối server!', { id: 'posts-load-error' });
  }, [isError]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 font-sans">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Quản lý bài viết (Lab 3 - Fullstack Integration)
        </h1>
        <p className="text-sm text-gray-500 mt-1">Next.js App Router + Express REST API</p>
      </header>

      {/* Form tạo bài viết */}
      <PostForm />

      {/* Danh sách bài viết */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Danh sách bài viết{posts ? ` (${posts.length})` : ''}
        </h2>

        {isLoading && <p className="text-gray-500 text-sm">Đang tải...</p>}

        {isError && (
          <p className="text-red-500 text-sm">
            Không thể tải dữ liệu. Backend đã chạy ở port 5000 chưa?{' '}
            <button onClick={() => refetch()} className="underline cursor-pointer">
              Thử lại
            </button>
          </p>
        )}

        {posts?.length === 0 && (
          <p className="text-gray-500 text-sm italic">Chưa có bài viết nào.</p>
        )}

        {posts?.map((p) => <PostCard key={p.id} post={p} />)}
      </section>
    </div>
  );
}
