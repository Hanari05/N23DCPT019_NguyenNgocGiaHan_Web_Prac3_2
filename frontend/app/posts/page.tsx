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
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 font-sans">
      <header className="mb-10">
        <span className="inline-block rounded-full bg-sky-100 text-sky-600 text-xs font-semibold px-3 py-1 mb-3">
          Lab 3 · Fullstack Integration
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800">
          Quản lý{' '}
          <span className="bg-gradient-to-r from-pink-500 to-sky-500 bg-clip-text text-transparent">
            bài viết
          </span>
        </h1>
        <p className="mt-2 text-slate-500">Next.js App Router + Express REST API</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr] items-start">
        {/* Form tạo bài viết (cố định bên trái trên màn hình rộng) */}
        <div className="lg:sticky lg:top-6">
          <PostForm />
        </div>

        {/* Danh sách bài viết */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Danh sách bài viết{posts ? ` (${posts.length})` : ''}
          </h2>

          {isLoading && <p className="text-slate-400 text-sm">Đang tải...</p>}

          {isError && (
            <p className="text-rose-600 text-sm">
              Không thể tải dữ liệu. Backend đã chạy ở port 5000 chưa?{' '}
              <button onClick={() => refetch()} className="underline cursor-pointer">
                Thử lại
              </button>
            </p>
          )}

          {posts?.length === 0 && (
            <p className="text-slate-400 text-sm italic">Chưa có bài viết nào.</p>
          )}

          {posts?.map((p) => <PostCard key={p.id} post={p} />)}
        </section>
      </div>
    </div>
  );
}
