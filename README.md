# LAB 3: Fullstack Integration — NextJS + Express
**Họ và tên:** Nguyễn Ngọc Gia Hân · **MSSV:** N23DCPT019  
**Môn học:** Lập trình Web  
**Chủ đề:** Ứng dụng quản lý **bài viết và bình luận**: frontend NextJS (port 3000) giao tiếp với backend Express (port 5000).

---

## 📁 Cấu trúc thư mục dự án

```text
N23DCPT019_NguyenNgocGiaHan_Web_Prac3b/
├── backend/
│   ├── .env                    # PORT, FRONTEND_ORIGIN (mẫu: .env.example)
│   ├── data.json               # Dữ liệu bài viết + bình luận (tự tạo khi chạy lần đầu)
│   ├── package.json
│   └── server.js               # Express :5000 — CORS, REST API, lưu file JSON
├── docs/                       # Ảnh minh chứng thí nghiệm lỗi CORS (Bước 2)
└── frontend/
    ├── app/
    │   ├── layout.tsx          # RootLayout: Providers (React Query) + Toaster
    │   ├── page.tsx            # Chuyển hướng vào /posts
    │   └── posts/
    │       ├── page.tsx        # Danh sách + form đăng bài
    │       └── [id]/page.tsx   # Chi tiết bài viết + bình luận
    ├── components/
    │   ├── Providers.tsx       # QueryClientProvider (staleTime, retry)
    │   ├── PostForm.tsx        # Form đăng bài
    │   ├── PostCard.tsx        # Bài viết: Sửa inline, Xoá, số bình luận, ô bình luận
    │   └── CommentForm.tsx     # Ô nhập bình luận
    ├── lib/
    │   ├── api.ts              # Axios instance + getErrorMessage
    │   ├── queries.ts          # Toàn bộ useQuery / useMutation
    │   ├── fetch-example.ts    # Ví dụ Bước 5: gọi API bằng fetch thuần (chỉ tham khảo)
    │   ├── types.ts            # Post, PostComment
    │   └── ui.ts               # Class Tailwind dùng chung
    ├── next.config.ts          # Proxy rewrites sang backend
    ├── .env.example            # NEXT_PUBLIC_API_URL
    └── package.json
```

> `node_modules/` không có trong thư mục nộp bài. Chạy `npm install` ở mỗi thư mục để khôi phục.

---

## 🚀 Hướng dẫn khởi chạy

### 1. Backend (Port 5000)
```bash
cd backend
npm install   # lần đầu hoặc sau khi giải nén
npm start     # hoặc: node server.js  |  npm run dev (tự restart khi sửa code)
```

### 2. Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
Truy cập `http://localhost:3000` → tự động điều hướng sang `/posts`.

Cấu hình tuỳ chọn: `backend/.env` (`PORT`, `FRONTEND_ORIGIN`) và `frontend/.env.local` (`NEXT_PUBLIC_API_URL`, xem mẫu `.env.example`).

---

## 🔌 API

| Method | Route | Mô tả | Mã trả về |
|---|---|---|---|
| GET | `/api/posts` | Danh sách bài viết (kèm `commentCount`) | 200 |
| GET | `/api/posts/:id` | Chi tiết một bài viết | 200 / 404 |
| POST | `/api/posts` | Tạo bài `{ title, content, author }` | 201 / 400 |
| PUT | `/api/posts/:id` | Sửa `title`, `content`, `author` (không sửa được `id`) | 200 / 400 / 404 |
| DELETE | `/api/posts/:id` | Xoá bài và các bình luận của bài | 200 / 404 |
| GET | `/api/posts/:id/comments` | Bình luận của một bài | 200 / 404 |
| POST | `/api/posts/:id/comments` | Thêm bình luận `{ author, content }` | 201 / 400 / 404 |
| DELETE | `/api/comments/:commentId` | Xoá một bình luận | 200 / 404 |

---

## 📌 Các nội dung đã hoàn thành

### Phần bắt buộc (Tiết 1 → Tiết 5)

- [x] **Tiết 1 — Thiết lập môi trường & CORS**  
  Middleware `cors()` chỉ cho phép origin của frontend (`FRONTEND_ORIGIN`, mặc định `http://localhost:3000`).  
  Proxy `rewrites()` trong `next.config.ts` chuyển tiếp `/api/:path*` sang backend (xem mục *Dùng proxy* bên dưới).

- [x] **Tiết 2 — Form → API Backend**  
  `POST /api/posts` có validation, trả `400` nếu thiếu trường, `201` nếu thành công.  
  Axios instance tập trung tại `frontend/lib/api.ts`.

- [x] **Tiết 3 — Toast & Debug**  
  `<Toaster position="top-right" />` trong `layout.tsx`. Dùng `toast.success`, `toast.error` và `toast.promise` (loading → success/error) khi đăng/sửa bài.  
  Backend có logger middleware in `METHOD /url` và body của POST/PUT ra terminal.

- [x] **Tiết 4–5 — Xoá bài viết end-to-end**  
  `DELETE /api/posts/:id` trả `200` hoặc `404`; nút Xoá có `confirm()`.  
  **Optimistic update đúng nghĩa:** `onMutate` cập nhật cache và UI *trước khi* gọi API, `onError` rollback về dữ liệu cũ, `onSettled` đồng bộ lại với server.

### Phần nâng cao

- [x] **Nâng cao 1 — Sửa bài viết (PUT):** nút **Sửa** mở inline form (tiêu đề + nội dung). Backend chỉ chấp nhận 3 trường `title`, `content`, `author`, từ chối giá trị rỗng, tự ghi `updatedAt`; `id` và `createdAt` không thể bị ghi đè.
- [x] **Nâng cao 2 — React Query:** thay `useEffect + fetch` bằng `useQuery`/`useMutation` (`lib/queries.ts`). `invalidateQueries` làm mới cache sau mỗi thao tác ghi; `staleTime = 30s` (trong `Providers.tsx`) kiểm soát tần suất refetch; React Query truyền `AbortSignal` vào axios nên request bị huỷ khi component unmount.
- [x] **Nâng cao 3 — Lưu `data.json`:** đọc/ghi bằng `fs.promises`; ghi qua file tạm + `rename` để không hỏng file khi tắt giữa chừng; hàng đợi `withLock` để các request đồng thời không ghi đè nhau. Dữ liệu còn nguyên sau khi restart server.
- [x] **Nâng cao 4 — Bình luận:** đủ 3 route theo đề; ô nhập bình luận dưới mỗi bài; số bình luận hiển thị trên từng bài; trang `/posts/[id]` hiển thị bài đầy đủ + danh sách bình luận + nút xoá từng bình luận. "Real-time" thực hiện bằng `refetchInterval` 5 giây (polling) kết hợp invalidate ngay sau mỗi thao tác (không dùng WebSocket).

---

## ✅ Đối chiếu với đề Lab 3

| Yêu cầu của đề | Trạng thái | Ghi chú |
|---|---|---|
| Tiết 1: dựng 2 server, `cors()` đúng cấu hình, `GET /api/posts` | ✅ | |
| Tiết 1: tái hiện lỗi CORS, chụp màn hình, kết luận ở phía nào | ✅ | Ảnh trong `docs/` |
| Tiết 1: proxy `rewrites()` (cách thay thế) | ✅ | Bật bằng `NEXT_PUBLIC_API_URL=` (rỗng) |
| Tiết 2: `POST /api/posts` + validation 400 / 201 | ✅ | |
| Tiết 2: form bằng `fetch` thuần (Bước 5) | ✅ | Ví dụ đầy đủ ở `frontend/lib/fetch-example.ts` (ứng dụng chính dùng axios) |
| Tiết 2: axios + `lib/api.ts` (Bước 6) | ✅ | |
| Tiết 3: `react-hot-toast`, `Toaster`, success / error / `toast.promise` | ✅ | |
| Tiết 3: debug (logger middleware, log body), bảng lỗi thường gặp | ✅ | |
| Tiết 4–5: `DELETE`, `confirm()`, nút Xoá, cập nhật không cần F5 | ✅ | Optimistic update có rollback |
| Checklist nộp bài (6 mục) | ✅ | Không còn lỗi đỏ sau khi khôi phục `cors()` (ảnh trong `docs/`) |
| Nâng cao 1 — PUT sửa bài + inline form | ✅ | |
| Nâng cao 2 — React Query (`useQuery`, `useMutation`, `invalidateQueries`, `staleTime`) | ✅ | |
| Nâng cao 3 — lưu `data.json` bằng `fs.promises` | ✅ | |
| Nâng cao 4 — Bình luận (3 route, ô nhập, đếm số, trang `/posts/[id]`) | ✅ | "Real-time" bằng polling 5 giây |

## 🔁 Dùng proxy thay cho CORS (Bước 3)

Mặc định frontend gọi thẳng `http://localhost:5000` nên backend cần `cors()`. Để dùng proxy `rewrites()`, tạo `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=
```

Khi đó frontend gọi `/api/...` (cùng origin) và NextJS tự chuyển tiếp sang backend, không cần CORS. Khởi động lại `npm run dev` sau khi đổi biến môi trường.

## 🧪 Thí nghiệm tái hiện lỗi CORS (Bước 2)

**Các bước thực hiện:**

1. Trong `backend/server.js`, comment khối `app.use(cors({...}))`, restart backend.
2. Mở `http://localhost:3000/posts`, mở DevTools → Console và Network, ghi lại lỗi.
3. Khôi phục `cors()`, restart backend, reload — lỗi biến mất.

### Trước khi khắc phục (đã tắt `cors()`)

**1. Đoạn code đã comment `cors()`**

![Code đã tắt cors()](docs/cors-1-code-tat-cors.png)

**2. Console: trình duyệt báo lỗi CORS** — origin `http://localhost:3000` gọi `http://localhost:5000/api/posts` bị chặn vì thiếu header `Access-Control-Allow-Origin`.

![Console báo lỗi CORS](docs/cors-2-console.png)

Lỗi lặp lại nhiều lần vì danh sách tự refetch mỗi 5 giây (`refetchInterval`) và React Query thử lại khi lỗi:

![Console lỗi CORS lặp lại](docs/cors-2b-console-lap-lai.png)

**3. Terminal backend: server vẫn nhận request** (`GET /api/posts`), không hề hỏng.

![Terminal backend vẫn nhận request](docs/cors-3-terminal-backend.png)

**4. Network → Headers: server trả `200 OK` nhưng Response headers không có `Access-Control-Allow-Origin`.**

![Response headers thiếu Access-Control-Allow-Origin](docs/cors-4-network-headers.png)

### Sau khi khôi phục `cors()`

Console không còn lỗi đỏ, các request `posts` kết thúc thành công và có dữ liệu trả về (516 B).

![Sau khi khôi phục cors()](docs/cors-5-sau-khoi-phuc.png)

> **Kết luận:** lỗi CORS xảy ra ở **trình duyệt (client)**, không phải ở server. Server vẫn nhận và xử lý request, thậm chí trả `200 OK` (xem ảnh 3 và 4), nhưng vì response thiếu header `Access-Control-Allow-Origin` nên trình duyệt chặn không cho JavaScript đọc dữ liệu. Header này phải do **server** gửi về, bằng middleware `cors()`.

## ⚖️ `fetch` thuần so với `axios` (Bước 5 → 6)

```ts
// fetch: phải tự kiểm tra res.ok, tự parse JSON, tự set header
const res = await fetch('http://localhost:5000/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title, content, author }),
});
if (!res.ok) throw new Error((await res.json()).error);
const post = await res.json();

// axios: baseURL + header cấu hình một lần, tự parse JSON, tự ném lỗi với status >= 400
const { data: post } = await api.post('/api/posts', { title, content, author });
```

Dự án dùng axios vì có `err.response.data.error` để lấy thông báo lỗi từ server (`getErrorMessage` trong `lib/api.ts`) và dễ thêm interceptor sau này.

## 🛠️ Debug nhanh

| Lỗi | Hướng xử lý |
|---|---|
| CORS error | Kiểm tra `cors()` và `FRONTEND_ORIGIN` khớp origin của frontend |
| 404 Not Found | Sai URL hoặc sai HTTP method |
| 400 Bad Request | Thiếu trường, hoặc thiếu header `Content-Type: application/json` |
| 500 Internal Error | Xem terminal backend |
| ERR_CONNECTION_REFUSED | Backend chưa chạy hoặc sai port |
