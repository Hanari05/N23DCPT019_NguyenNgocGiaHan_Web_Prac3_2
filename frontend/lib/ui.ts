// Các class Tailwind dùng chung để giao diện đồng nhất giữa các component
export const inputClass =
  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600';

export const labelClass = 'block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300';

export const cardClass =
  'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm';

export const primaryButtonClass =
  'bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-150 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed';

export const dangerLinkClass =
  'text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition shrink-0 cursor-pointer disabled:opacity-50';

export const editLinkClass =
  'text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950/30 transition shrink-0 cursor-pointer';
