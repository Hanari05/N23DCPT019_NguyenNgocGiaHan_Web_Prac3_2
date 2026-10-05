// Các class Tailwind dùng chung — tông hồng pha xanh.
// ĐỔI MÀU: thay "pink" / "sky" bên dưới bằng tên màu Tailwind khác
// (rose, fuchsia, purple, violet, indigo, blue, cyan, teal, emerald...).
//   pink = màu chủ đạo 1 (viền, nút, tiêu đề)
//   sky  = màu chủ đạo 2 (focus, liên kết, nút Sửa, đuôi gradient)

export const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-white/80 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-200/70 focus:border-sky-400 transition';

export const labelClass = 'block text-sm font-semibold mb-1.5 text-slate-600';

export const cardClass =
  'bg-white/90 backdrop-blur border border-pink-100 rounded-2xl shadow-[0_8px_30px_-12px_rgba(99,160,255,0.35)]';

export const primaryButtonClass =
  'bg-gradient-to-r from-pink-500 to-sky-500 hover:from-pink-600 hover:to-sky-600 text-white font-semibold rounded-xl shadow-md shadow-sky-300/40 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed';

export const dangerLinkClass =
  'text-rose-600 hover:text-rose-800 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 transition shrink-0 cursor-pointer disabled:opacity-50';

export const editLinkClass =
  'text-sky-600 hover:text-sky-800 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-sky-50 transition shrink-0 cursor-pointer';
