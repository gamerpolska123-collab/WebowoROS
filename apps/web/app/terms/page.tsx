export const metadata = {
  title: "Regulamin — WebowoROS",
  description: "Regulamin korzystania z systemu zamówień online.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-neutral-900 mb-8">Regulamin</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 space-y-6">
          <section><h2 className="text-xl font-bold text-neutral-900 mb-3">1. Postanowienia ogólne</h2><p className="text-neutral-600 leading-relaxed">Regulamin określa zasady korzystania z systemu zamówień online WebowoROS.</p></section>
          <section><h2 className="text-xl font-bold text-neutral-900 mb-3">2. Składanie zamówień</h2><p className="text-neutral-600 leading-relaxed">Zamówienia składa się przez stronę internetową. Zamówienie jest wiążące po potwierdzeniu.</p></section>
          <section><h2 className="text-xl font-bold text-neutral-900 mb-3">3. Ceny i płatności</h2><p className="text-neutral-600 leading-relaxed">Ceny w PLN, zawierają VAT. Metody: karta, BLIK, gotówka.</p></section>
          <section><h2 className="text-xl font-bold text-neutral-900 mb-3">4. Dostawa</h2><p className="text-neutral-600 leading-relaxed">Dostawa na terenie określonym przez restaurację.</p></section>
          <section><h2 className="text-xl font-bold text-neutral-900 mb-3">5. Anulowanie</h2><p className="text-neutral-600 leading-relaxed">Możliwe do rozpoczęcia realizacji.</p></section>
          <section><h2 className="text-xl font-bold text-neutral-900 mb-3">6. Reklamacje</h2><p className="text-neutral-600 leading-relaxed">Kontakt w ciągu 24h od dostawy.</p></section>
        </div>
      </div>
    </div>
  );
}
