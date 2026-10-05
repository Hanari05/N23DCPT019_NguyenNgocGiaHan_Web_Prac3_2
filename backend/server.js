require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const DATA_PATH = path.join(__dirname, 'data.json');

/* -------------------------------------------------------------------------- */
/*  Middleware                                                                */
/* -------------------------------------------------------------------------- */
app.use(cors({
  origin: FRONTEND_ORIGIN, // chỉ cho phép NextJS
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Logger middleware hỗ trợ debug theo yêu cầu bài lab
app.use((req, _, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('  body:', req.body);
  }
  next();
});

/* -------------------------------------------------------------------------- */
/*  Lưu trữ dữ liệu vào file JSON (Nâng cao 3)                                */
/*  data.json có dạng: { "posts": [...], "comments": [...] }                  */
/* -------------------------------------------------------------------------- */
const SEED = {
  posts: [
    { id: 1, title: 'Bài viết đầu tiên', content: 'Nội dung bài 1', author: 'Admin' },
    { id: 2, title: 'Hướng dẫn NextJS', content: 'Nội dung bài 2', author: 'Admin' },
  ],
  comments: [],
};

async function writeData(data) {
  // Ghi ra file tạm rồi đổi tên: tránh hỏng data.json nếu server tắt giữa chừng
  const tmp = `${DATA_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, DATA_PATH);
}

async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    // Hỗ trợ định dạng cũ (chỉ là một mảng bài viết)
    if (Array.isArray(parsed)) return { posts: parsed, comments: [] };
    return { posts: parsed.posts ?? [], comments: parsed.comments ?? [] };
  } catch (err) {
    if (err.code === 'ENOENT') {
      const fresh = structuredClone(SEED);
      await writeData(fresh);
      return fresh;
    }
    throw err;
  }
}

// Hàng đợi: mỗi thao tác đọc-sửa-ghi chạy lần lượt, tránh 2 request ghi đè nhau
let queue = Promise.resolve();
function withLock(task) {
  const run = queue.then(task);
  queue = run.catch(() => {});
  return run;
}

// Sinh id không bao giờ trùng, kể cả khi 2 request đến cùng 1 mili-giây
let lastId = 0;
function genId() {
  lastId = Math.max(Date.now(), lastId + 1);
  return lastId;
}

const clean = (v) => (typeof v === 'string' ? v.trim() : '');
const nowISO = () => new Date().toISOString();

/* -------------------------------------------------------------------------- */
/*  Posts                                                                     */
/* -------------------------------------------------------------------------- */

// GET /api/posts — kèm commentCount cho từng bài
app.get('/api/posts', async (req, res) => {
  const { posts, comments } = await withLock(readData);
  const counts = {};
  for (const c of comments) counts[c.postId] = (counts[c.postId] || 0) + 1;
  res.json(posts.map((p) => ({ ...p, commentCount: counts[p.id] || 0 })));
});

// GET /api/posts/:id — dùng cho trang chi tiết /posts/:id
app.get('/api/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { posts, comments } = await withLock(readData);
  const post = posts.find((p) => p.id === id);
  if (!post) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  res.json({ ...post, commentCount: comments.filter((c) => c.postId === id).length });
});

// POST /api/posts
app.post('/api/posts', async (req, res) => {
  const title = clean(req.body?.title);
  const content = clean(req.body?.content);
  const author = clean(req.body?.author);
  // Validation đơn giản
  if (!title || !content || !author) {
    return res.status(400).json({ error: 'Thiếu dữ liệu' });
  }
  const newPost = await withLock(async () => {
    const data = await readData();
    const post = { id: genId(), title, content, author, createdAt: nowISO() };
    data.posts.push(post);
    await writeData(data);
    return post;
  });
  res.status(201).json({ ...newPost, commentCount: 0 });
});

// PUT /api/posts/:id — Nâng cao 1: chỉ cho phép sửa title / content / author
app.put('/api/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  const updates = {};
  for (const field of ['title', 'content', 'author']) {
    if (req.body?.[field] !== undefined) {
      const value = clean(req.body[field]);
      if (!value) return res.status(400).json({ error: `Trường "${field}" không được để trống` });
      updates[field] = value;
    }
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
  }

  const result = await withLock(async () => {
    const data = await readData();
    const index = data.posts.findIndex((p) => p.id === id);
    if (index === -1) return null;
    // id & createdAt luôn được giữ nguyên, client không thể ghi đè
    data.posts[index] = { ...data.posts[index], ...updates, updatedAt: nowISO() };
    await writeData(data);
    return data.posts[index];
  });
  if (!result) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  res.json(result);
});

// DELETE /api/posts/:id — xoá luôn các bình luận của bài viết
app.delete('/api/posts/:id', async (req, res) => {
  const id = Number(req.params.id);
  const found = await withLock(async () => {
    const data = await readData();
    const index = data.posts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    data.posts.splice(index, 1);
    data.comments = data.comments.filter((c) => c.postId !== id);
    await writeData(data);
    return true;
  });
  if (!found) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  res.json({ message: 'Đã xoá thành công' });
});

/* -------------------------------------------------------------------------- */
/*  Comments (Nâng cao 4)                                                     */
/* -------------------------------------------------------------------------- */

// GET /api/posts/:id/comments
app.get('/api/posts/:id/comments', async (req, res) => {
  const postId = Number(req.params.id);
  const { posts, comments } = await withLock(readData);
  if (!posts.some((p) => p.id === postId)) {
    return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  }
  res.json(comments.filter((c) => c.postId === postId));
});

// POST /api/posts/:id/comments  — body: { author, content }
app.post('/api/posts/:id/comments', async (req, res) => {
  const postId = Number(req.params.id);
  const author = clean(req.body?.author);
  const content = clean(req.body?.content);
  if (!author || !content) {
    return res.status(400).json({ error: 'Thiếu dữ liệu' });
  }
  const comment = await withLock(async () => {
    const data = await readData();
    if (!data.posts.some((p) => p.id === postId)) return null;
    const c = { id: genId(), postId, author, content, createdAt: nowISO() };
    data.comments.push(c);
    await writeData(data);
    return c;
  });
  if (!comment) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  res.status(201).json(comment);
});

// DELETE /api/comments/:commentId
app.delete('/api/comments/:commentId', async (req, res) => {
  const commentId = Number(req.params.commentId);
  const found = await withLock(async () => {
    const data = await readData();
    const index = data.comments.findIndex((c) => c.id === commentId);
    if (index === -1) return false;
    data.comments.splice(index, 1);
    await writeData(data);
    return true;
  });
  if (!found) return res.status(404).json({ error: 'Không tìm thấy bình luận' });
  res.json({ message: 'Đã xoá bình luận' });
});

/* -------------------------------------------------------------------------- */
/*  404 & xử lý lỗi chung                                                     */
/* -------------------------------------------------------------------------- */
app.use((req, res) => {
  res.status(404).json({ error: 'Không tìm thấy đường dẫn' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Body không phải JSON hợp lệ' });
  }
  console.error(err); // 500 = lỗi trong code server -> xem terminal này
  res.status(500).json({ error: 'Lỗi server' });
});

app.listen(PORT, () => {
  console.log(`Backend chạy tại port :${PORT}`);
});
