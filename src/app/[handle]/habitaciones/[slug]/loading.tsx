'use client';

export default function LoadingRoomPage() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7">
          <div className="w-full h-[320px] md:h-[420px] bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="md:col-span-5">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="mt-6 h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}
