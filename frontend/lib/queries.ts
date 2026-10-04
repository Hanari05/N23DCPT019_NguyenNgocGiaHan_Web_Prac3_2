'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import type { Post, PostComment, PostInput } from '@/lib/types';

/** Tự refetch mỗi 5 giây -> số bình luận / danh sách cập nhật gần như real-time. */
export const POLL_MS = 5000;

/**
 * Cấu trúc key theo thứ bậc: invalidate ['posts'] sẽ làm mới cả
 * danh sách, trang chi tiết và bình luận của mọi bài (cùng tiền tố).
 */
export const queryKeys = {
  posts: ['posts'] as const,
  post: (id: number) => ['posts', id] as const,
  comments: (postId: number) => ['posts', postId, 'comments'] as const,
};

/* ------------------------------- Posts ------------------------------------ */

export function usePosts() {
  return useQuery({
    queryKey: queryKeys.posts,
    // signal: React Query tự huỷ request nếu component unmount (thay AbortController thủ công)
    queryFn: ({ signal }) => api.get<Post[]>('/api/posts', { signal }).then((r) => r.data),
    refetchInterval: POLL_MS,
  });
}

export function usePost(id: number) {
  return useQuery({
    queryKey: queryKeys.post(id),
    queryFn: ({ signal }) => api.get<Post>(`/api/posts/${id}`, { signal }).then((r) => r.data),
    enabled: Number.isFinite(id),
    refetchInterval: POLL_MS,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    // toast.promise: tự hiện loading -> success / error
    mutationFn: (input: PostInput) =>
      toast.promise(api.post<Post>('/api/posts', input).then((r) => r.data), {
        loading: 'Đang lưu...',
        success: 'Đăng bài thành công!',
        error: (err) => getErrorMessage(err),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.posts }),
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<PostInput> & { id: number }) =>
      toast.promise(api.put<Post>(`/api/posts/${id}`, data).then((r) => r.data), {
        loading: 'Đang cập nhật...',
        success: 'Cập nhật thành công!',
        error: (err) => getErrorMessage(err),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.posts }),
  });
}

/** Xoá với optimistic update thực sự: UI đổi ngay, lỗi thì rollback. */
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/posts/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts });
      const previous = queryClient.getQueryData<Post[]>(queryKeys.posts);
      queryClient.setQueryData<Post[]>(queryKeys.posts, (old) =>
        old?.filter((p) => p.id !== id),
      );
      return { previous };
    },
    onSuccess: () => toast.success('Đã xoá bài viết', { icon: '🗑️' }),
    onError: (err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.posts, context.previous);
      toast.error(getErrorMessage(err, 'Xoá thất bại, thử lại!'));
    },
    // Dù thành công hay lỗi đều đồng bộ lại với server
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.posts }),
  });
}

/* ------------------------------ Comments ---------------------------------- */

export function useComments(postId: number) {
  return useQuery({
    queryKey: queryKeys.comments(postId),
    queryFn: ({ signal }) =>
      api
        .get<PostComment[]>(`/api/posts/${postId}/comments`, { signal })
        .then((r) => r.data),
    enabled: Number.isFinite(postId),
    refetchInterval: POLL_MS,
  });
}

export function useAddComment(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { author: string; content: string }) =>
      api.post<PostComment>(`/api/posts/${postId}/comments`, input).then((r) => r.data),
    onSuccess: () => toast.success('Đã gửi bình luận'),
    onError: (err) => toast.error(getErrorMessage(err, 'Gửi bình luận thất bại!')),
    // Làm mới danh sách bình luận + commentCount trên danh sách bài
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.posts }),
  });
}

export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => api.delete(`/api/comments/${commentId}`),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments(postId) });
      const previous = queryClient.getQueryData<PostComment[]>(queryKeys.comments(postId));
      queryClient.setQueryData<PostComment[]>(queryKeys.comments(postId), (old) =>
        old?.filter((c) => c.id !== commentId),
      );
      return { previous };
    },
    onSuccess: () => toast.success('Đã xoá bình luận', { icon: '🗑️' }),
    onError: (err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.comments(postId), context.previous);
      }
      toast.error(getErrorMessage(err, 'Xoá bình luận thất bại!'));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.posts }),
  });
}
