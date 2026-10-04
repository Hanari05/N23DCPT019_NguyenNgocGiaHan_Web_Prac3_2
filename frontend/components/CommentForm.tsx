'use client';

import { useId, useState } from 'react';
import toast from 'react-hot-toast';
import { useAddComment } from '@/lib/queries';
import { inputClass, primaryButtonClass } from '@/lib/ui';

export default function CommentForm({ postId }: { postId: number }) {
  const uid = useId(); // id duy nhất cho mỗi form (có nhiều form trên cùng một trang)
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const addComment = useAddComment(postId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) {
      toast.error('Vui lòng nhập tên và nội dung bình luận');
      return;
    }
    addComment.mutate(
      { author, content },
      { onSuccess: () => setContent('') }, // giữ lại tên để bình luận tiếp
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor={`${uid}-author`} className="sr-only">
        Tên của bạn
      </label>
      <input
        id={`${uid}-author`}
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Tên của bạn"
        className={`${inputClass} !py-1.5 text-sm sm:w-36`}
      />
      <label htmlFor={`${uid}-content`} className="sr-only">
        Nội dung bình luận
      </label>
      <input
        id={`${uid}-content`}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết bình luận..."
        className={`${inputClass} !py-1.5 text-sm flex-1`}
      />
      <button
        type="submit"
        disabled={addComment.isPending}
        className={`px-4 py-1.5 text-sm ${primaryButtonClass}`}
      >
        {addComment.isPending ? 'Đang gửi...' : 'Gửi'}
      </button>
    </form>
  );
}
