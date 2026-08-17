export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-neutral-400 font-medium">Ładowanie panelu...</p>
      </div>
    </div>
  );
}
