'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCreatePost } from '@/lib/queries';
import { cardClass, inputClass, labelClass, primaryButtonClass } from '@/lib/ui';

export default function PostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const createPost = useCreatePost();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !author.trim()) {
      toast.error('Thiếu dữ liệu! Vui lòng điền đủ các trường.');
      return;
    }
    // Toast loading/success/error đã được xử lý trong useCreatePost (toast.promise)
    createPost.mutate(
      { title, content, author },
      {
        onSuccess: () => {
          setTitle('');
          setContent('');
          setAuthor('');
        },
      },
    );
  };

  return (
    <section className={`${cardClass} p-6`}>
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Thêm bài viết mới
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="post-title" className={labelClass}>
            Tiêu đề
          </label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề bài viết..."
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="post-content" className={labelClass}>
            Nội dung
          </label>
          <textarea
            id="post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung bài viết..."
            rows={3}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="post-author" className={labelClass}>
            Tác giả
          </label>
          <input
            id="post-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Tên tác giả..."
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={createPost.isPending}
          className={`w-full py-2 px-4 ${primaryButtonClass}`}
        >
          {createPost.isPending ? 'Đang gửi...' : 'Đăng bài'}
        </button>
      </form>
    </section>
  );
}
