export const metadata = {
  title: "Offline — WebowoROS",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Jesteś offline</h1>
        <p className="text-neutral-500 mb-6">Straciłeś połączenie z internetem.</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition">
          Spróbuj ponownie
        </button>
      </div>
    </div>
  );
}
