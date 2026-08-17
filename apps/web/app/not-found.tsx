import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-black text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Strona nie istnieje</h2>
        <p className="text-neutral-500 mb-6">Przepraszamy, nie mogliśmy znaleźć tej strony.</p>
        <Link href="/" className="px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition">
          Wróć na stronę główną
        </Link>
      </div>
    </div>
  );
}
