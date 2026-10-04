'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import toast from 'react-hot-toast';
import CommentForm from '@/components/CommentForm';
import { useDeletePost, useUpdatePost } from '@/lib/queries';
import type { Post } from '@/lib/types';
import {
  cardClass,
  dangerLinkClass,
  editLinkClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from '@/lib/ui';

export function formatDate(iso?: string) {
  return iso ? new Date(iso).toLocaleString('vi-VN') : '';
}

export default function PostCard({ post }: { post: Post }) {
  const uid = useId();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const deletePost = useDeletePost();
  const updatePost = useUpdatePost();

  const startEdit = () => {
    setTitle(post.title);
    setContent(post.content);
    setEditing(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Tiêu đề và nội dung không được để trống');
      return;
    }
    updatePost.mutate({ id: post.id, title, content }, { onSuccess: () => setEditing(false) });
  };

  const handleDelete = () => {
    if (!confirm('Bạn chắc chắn muốn xoá bài viết này?')) return;
    deletePost.mutate(post.id);
  };

  const count = post.commentCount ?? 0;

  return (
    <article className={`${cardClass} p-4 transition hover:shadow`}>
      {editing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label htmlFor={`${uid}-title`} className={labelClass}>
              Tiêu đề
            </label>
            <input
              id={`${uid}-title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-content`} className={labelClass}>
              Nội dung
            </label>
            <textarea
              id={`${uid}-content`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={updatePost.isPending}
              className={`px-4 py-1.5 text-sm ${primaryButtonClass}`}
            >
              {updatePost.isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer"
            >
              Huỷ
            </button>
          </div>
        </form>
      ) : (
        <div className="flex justify-between items-start">
          <div className="pr-4 min-w-0">
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
              <Link href={`/posts/${post.id}`} className="hover:underline">
                {post.title}
              </Link>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">
              {post.content}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Tác giả:{' '}
              <span className="font-medium text-gray-600 dark:text-gray-400">{post.author}</span>
              {post.createdAt && ` • ${formatDate(post.createdAt)}`}
              {post.updatedAt && ' • đã chỉnh sửa'}
            </p>
          </div>
          <div className="flex shrink-0">
            <button onClick={startEdit} className={editLinkClass}>
              Sửa
            </button>
            <button onClick={handleDelete} disabled={deletePost.isPending} className={dangerLinkClass}>
              Xoá
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          href={`/posts/${post.id}`}
          className="inline-block mb-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
        >
          {count} bình luận
        </Link>
        <CommentForm postId={post.id} />
      </div>
    </article>
  );
}
