export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-black text-red-500 mb-4">403</h1>
        <p className="text-xl text-white mb-2">Brak dostępu</p>
        <p className="text-neutral-400">Nie masz uprawnień do panelu administracyjnego.</p>
        <a href="/login" className="mt-6 inline-block px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition">
          Wróć do logowania
        </a>
      </div>
    </div>
  );
}
