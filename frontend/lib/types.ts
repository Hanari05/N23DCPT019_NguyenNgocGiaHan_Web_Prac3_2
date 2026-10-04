export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt?: string;
  updatedAt?: string;
  commentCount?: number;
}

// Đặt tên PostComment để không trùng với kiểu `Comment` có sẵn của DOM
export interface PostComment {
  id: number;
  postId: number;
  author: string;
  content: string;
  createdAt: string;
}

export interface PostInput {
  title: string;
  content: string;
  author: string;
}
