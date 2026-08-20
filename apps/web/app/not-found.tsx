import Link from "next/link";
import { Pizza } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl" />
          <div className="relative bg-white dark:bg-neutral-900 rounded-full p-6 shadow-xl">
            <Pizza className="w-16 h-16 text-red-500" />
          </div>
        </div>
        <h1 className="text-7xl font-black text-red-600 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          Ups! Ta strona zaginęła
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
          Wygląda na to, że ktoś zjadł tę stronę. Nie martw się, mamy dużo innych smakołyków!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/" 
            className="px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition shadow-lg shadow-red-600/20"
          >
            Wróć na stronę główną
          </Link>
          <Link 
            href="/menu" 
            className="px-6 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
          >
            Przejdź do menu
          </Link>
        </div>
      </div>
    </div>
  );
}
