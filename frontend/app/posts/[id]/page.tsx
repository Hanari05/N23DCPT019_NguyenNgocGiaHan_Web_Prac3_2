'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CommentForm from '@/components/CommentForm';
import { formatDate } from '@/components/PostCard';
import { useComments, useDeleteComment, useDeletePost, usePost } from '@/lib/queries';
import { cardClass, dangerLinkClass } from '@/lib/ui';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const postId = Number(params.id);

  const { data: post, isLoading, isError } = usePost(postId);
  const { data: comments } = useComments(postId);
  const deletePost = useDeletePost();
  const deleteComment = useDeleteComment(postId);

  const handleDeletePost = () => {
    if (!confirm('Bạn chắc chắn muốn xoá bài viết này?')) return;
    deletePost.mutate(postId, { onSuccess: () => router.push('/posts') });
  };

  const handleDeleteComment = (commentId: number) => {
    if (!confirm('Xoá bình luận này?')) return;
    deleteComment.mutate(commentId);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 font-sans">
      <Link href="/posts" className="inline-block text-sm text-blue-600 hover:underline">
        ← Quay lại danh sách
      </Link>

      {isLoading && <p className="text-gray-500 text-sm">Đang tải...</p>}

      {isError && (
        <p className="text-red-500 text-sm">Không tìm thấy bài viết (có thể đã bị xoá).</p>
      )}

      {post && (
        <>
          <article className={`${cardClass} p-6`}>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{post.title}</h1>
            <p className="text-xs text-gray-400 mt-2">
              Tác giả:{' '}
              <span className="font-medium text-gray-600 dark:text-gray-400">{post.author}</span>
              {post.createdAt && ` • ${formatDate(post.createdAt)}`}
              {post.updatedAt && ` • chỉnh sửa lúc ${formatDate(post.updatedAt)}`}
            </p>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-gray-800 dark:text-gray-200">
              {post.content}
            </p>
            <button
              onClick={handleDeletePost}
              disabled={deletePost.isPending}
              className={`mt-4 -ml-3 ${dangerLinkClass}`}
            >
              Xoá bài viết
            </button>
          </article>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Bình luận ({comments?.length ?? post.commentCount ?? 0})
            </h2>

            <CommentForm postId={postId} />

            {comments?.length === 0 && (
              <p className="text-gray-500 text-sm italic">
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </p>
            )}

            <ul className="space-y-2">
              {comments?.map((c) => (
                <li key={c.id} className={`${cardClass} flex justify-between items-start p-3`}>
                  <div className="pr-4 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {c.author}{' '}
                      <span className="text-xs font-normal text-gray-400">
                        {formatDate(c.createdAt)}
                      </span>
                    </p>
                    <p className="mt-1 text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
                      {c.content}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteComment(c.id)} className={dangerLinkClass}>
                    Xoá
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
