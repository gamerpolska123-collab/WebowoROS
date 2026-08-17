export const metadata = {
  title: "Polityka Prywatności — WebowoROS",
  description: "Informacje o przetwarzaniu danych osobowych.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-neutral-900 mb-8">Polityka Prywatności</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 space-y-6">
          <section><h2 className="text-xl font-bold text-neutral-900 mb-3">1. Administrator danych</h2><p className="text-neutral-600 leading-relaxed">Administratorem danych jest właściciel restauracji korzystający z systemu WebowoROS.</p></section>
          <section><h2 className="text-xl font-bold text-neutral-900 mb-3">2. Jakie dane zbieramy?</h2><ul className="list-disc list-inside text-neutral-600 space-y-1"><li>Imię i nazwisko</li><li>Adres e-mail</li><li>Numer telefonu</li><li>Adres dostawy</li><li>Historia zamówień</li></ul></section>
          <section><h2 className="text-xl font-bold text-neutral-900 mb-3">3. Cel przetwarzania</h2><p className="text-neutral-600 leading-relaxed">Dane przetwarzamy wyłącznie w celu realizacji zamówień. Nie sprzedajemy danych osobom trzecim.</p></section>
          <section><h2 className="text-xl font-bold text-neutral-900 mb-3">4. Twoje prawa</h2><p className="text-neutral-600 leading-relaxed">Masz prawo do dostępu, sprostowania, usunięcia i przenoszenia danych.</p></section>
          <section><h2 className="text-xl font-bold text-neutral-900 mb-3">5. Cookies</h2><p className="text-neutral-600 leading-relaxed">Używamy cookies do działania strony i koszyka.</p></section>
          <section><h2 className="text-xl font-bold text-neutral-900 mb-3">6. Okres przechowywania</h2><p className="text-neutral-600 leading-relaxed">Dane przechowujemy przez okres niezbędny do realizacji zamówienia i zgodnie z przepisami.</p></section>
        </div>
      </div>
    </div>
  );
}
