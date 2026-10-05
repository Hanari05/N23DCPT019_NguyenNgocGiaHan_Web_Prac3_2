/**
 * VÍ DỤ BƯỚC 5 CỦA ĐỀ: gọi API bằng `fetch` thuần.
 *
 * File này chỉ để tham khảo / so sánh — ứng dụng KHÔNG import nó.
 * Ứng dụng thật dùng axios (lib/api.ts) + React Query (lib/queries.ts).
 *
 * Khác biệt chính so với axios:
 *  - Phải tự set header Content-Type và tự JSON.stringify(body)
 *  - fetch KHÔNG ném lỗi khi server trả 400 / 404 / 500 -> phải tự kiểm tra res.ok
 *  - Phải tự gọi res.json() để lấy dữ liệu
 */
import type { Post, PostInput } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    // Cố đọc thông báo lỗi { error: '...' } mà backend trả về
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Lỗi ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const fetchPosts = () => request<Post[]>('/api/posts');

export const createPostWithFetch = (input: PostInput) =>
  request<Post>('/api/posts', { method: 'POST', body: JSON.stringify(input) });

export const updatePostWithFetch = (id: number, input: Partial<PostInput>) =>
  request<Post>(`/api/posts/${id}`, { method: 'PUT', body: JSON.stringify(input) });

export const deletePostWithFetch = (id: number) =>
  request<{ message: string }>(`/api/posts/${id}`, { method: 'DELETE' });

/*
 * Cách dùng trong component (giống Bước 5 của đề):
 *
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     try {
 *       await createPostWithFetch({ title, content, author });
 *       setTitle(''); setContent(''); setAuthor('');
 *       // rồi tải lại danh sách: setPosts(await fetchPosts());
 *     } catch (err) {
 *       console.error((err as Error).message);
 *     }
 *   };
 */
