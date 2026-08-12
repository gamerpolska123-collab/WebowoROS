# Weryfikacja Licencji — Legalność Odsprzedaży

> **Cel**: Upewnienie się, że cały stack technologiczny pozwala na komercyjne użycie i odsprzedaż systemu bez konieczności płacenia osobom trzecim za licencje kodu.

---

## 1. Stack Kodu (Open Source — 100% darmowy, można odsprzedać)

| Technologia | Licencja | Komercyjne użycie | Odsprzedaż | Uwagi |
|-------------|----------|-------------------|------------|-------|
| **Next.js 14** | MIT | ✅ Tak | ✅ Tak | Darmowy, bez ograniczeń |
| **React 18** | MIT | ✅ Tak | ✅ Tak | Darmowy |
| **TypeScript** | Apache 2.0 | ✅ Tak | ✅ Tak | Darmowy |
| **Tailwind CSS** | MIT | ✅ Tak | ✅ Tak | Darmowy |
| **shadcn/ui** | MIT | ✅ Tak | ✅ Tak | Darmowy, komponenty open-source |
| **NestJS** | MIT | ✅ Tak | ✅ Tak | Darmowy |
| **Prisma ORM** | Apache 2.0 | ✅ Tak | ✅ Tak | Darmowy, bez ograniczeń |
| **PostgreSQL 16** | PostgreSQL License | ✅ Tak | ✅ Tak | Darmowy, open-source |
| **Redis 7** | BSD 3-clause / SSPL | ✅ Tak | ✅ Tak | Użytek wewnętrzny (Raspberry Pi w lokalu) — bez problemu. Alternatywnie: **Valkey** (BSD, fork Redisa) |
| **Socket.io** | MIT | ✅ Tak | ✅ Tak | Darmowy |
| **node-escpos** | MIT | ✅ Tak | ✅ Tak | Darmowy |
| **Zod** | MIT | ✅ Tak | ✅ Tak | Darmowy |
| **Docker** | Apache 2.0 | ✅ Tak | ✅ Tak | Darmowy |
| **Nginx** | BSD 2-clause | ✅ Tak | ✅ Tak | Darmowy |
| **pnpm** | MIT | ✅ Tak | ✅ Tak | Darmowy |
| **Turborepo** | MPL 2.0 | ✅ Tak | ✅ Tak | Darmowy |
| **Jest** | MIT | ✅ Tak | ✅ Tak | Darmowy |
| **Playwright** | Apache 2.0 | ✅ Tak | ✅ Tak | Darmowy |

**Wniosek**: Cały kod aplikacji (frontend, backend, baza, konteneryzacja, testy) jest na licencjach open-source pozwalających na komercyjne użycie i odsprzedaż **bez żadnych opłat licencyjnych**.

---

## 2. Usługi Zewnętrzne (Klient płaci bezpośrednio — nie my)

| Usługa | Model płatności | Czy to problem? |
|--------|----------------|-----------------|
| **Stripe** | % od transakcji (klient płaci Stripe) | ❌ Nie — to usługa płatnicza, nie licencja kodu. Klient zakłada własne konto Stripe. |
| **PayU** | % od transakcji (klient płaci PayU) | ❌ Nie — jak wyżej. |
| **Google Maps API** | Pay-as-you-go (klient płaci Google) | ❌ Nie — opcjonalna usługa. Można zastąpić OpenStreetMap (darmowy). |
| **Let's Encrypt** | Darmowy | ❌ Nie — darmowy SSL. |
| **GitHub Actions** | Darmowy dla publicznych repo | ❌ Nie — darmowy. |
| **SMSAPI / Twilio** | Per SMS (klient płaci) | ❌ Nie — opcjonalna usługa. |
| **SendGrid / Mailgun** | Per email (klient płaci) | ❌ Nie — opcjonalna usługa. Można użyć własnego SMTP. |

**Wniosek**: Żadna z usług zewnętrznych nie wymaga płatności od dewelopera. Klient płaci bezpośrednio dostawcom usług (Stripe, Google, SMS) za użycie — tak jak płaci za prąd czy internet.

---

## 3. Zamienniki Darmowe (Fallback)

Jeśli klient nie chce płacić za usługi zewnętrzne:

| Płatna usługa | Darmowy zamiennik | Wymagana zmiana |
|---------------|-------------------|-----------------|
| Google Maps API | OpenStreetMap + Leaflet | Zmiana biblioteki map |
| SMSAPI / Twilio | Brak (SMS zawsze kosztuje) | Opcjonalny moduł |
| SendGrid | Własny SMTP (np. Gmail, hosting) | Konfiguracja SMTP w .env |
| Stripe / PayU | Płatność przy odbiorze (gotówka) | Wyłączenie modułu płatności online |
| Redis (SSPL) | Valkey (BSD) | Zamiana obrazu Docker: `valkey/valkey` zamiast `redis` |

---

## 4. Rekomendacja Prawna

> **Zalecenie**: Przed odsprzedażą systemu klientowi, skonsultuj z prawnikiem:
> 1. Umowę licencyjną na odsprzedaż systemu (custom software development agreement)
> 2. Klauzulę o własności intelektualnej (IP assignment lub license)
> 3. RODO / politykę prywatności dostosowaną do restauracji

**Stack technologiczny nie stwarza żadnych prawnych przeszkód do odsprzedaży.** Wszystkie komponenty kodu są na permisywnych licencjach open-source (MIT, Apache 2.0, BSD).

---

## 5. Podsumowanie

✅ **Możesz legalnie odsprzedać ten system** bez płacenia osobom trzecim za licencje kodu.  
✅ **Cały kod jest open-source i darmowy** do komercyjnego użycia.  
✅ **Usługi zewnętrzne** (Stripe, PayU, Google Maps) to opcjonalne integracje — klient płaci za nie bezpośrednio, nie ty.  
✅ **System jest w 100% Twoją własnością** — możesz go sprzedać, zmodyfikować, rozszerzyć.
