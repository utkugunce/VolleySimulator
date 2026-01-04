# VolleySimulator - Project Core Context

> Türk Kadın Voleybol Ligleri için Tahmin ve Simülasyon Platformu
> Auto-generated: 2026-01-04

---

## 🎯 Proje Özeti

**VolleySimulator**, Türk kadın voleybol ligleri için geliştirilmiş kapsamlı bir tahmin ve simülasyon platformudur. Kullanıcılar maç sonuçlarını tahmin edebilir, senaryo simülasyonları yapabilir, puan tablosu senaryolarını görselleştirebilir ve gamification özellikleriyle etkileşimde bulunabilir.

---

## 🏗️ Teknoloji Stack'i

| Kategori | Teknoloji | Versiyon |
|----------|-----------|----------|
| **Framework** | Next.js (App Router) | 16.1.1 |
| **Build Tool** | Turbopack | - |
| **Dil** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Library** | shadcn/ui + Radix UI | - |
| **State** | React Query + Context API | - |
| **Database** | Supabase (PostgreSQL) | - |
| **Auth** | Supabase Auth (OAuth) | - |
| **i18n** | next-intl | TR, EN |
| **Charts** | Recharts | - |
| **Testing** | Jest + Playwright | - |
| **Deployment** | Vercel | - |

---

## 📊 Desteklenen Ligler

| Lig | Kod | Veri Dosyası |
|-----|-----|--------------|
| Voleybol Süper Ligi (VSL) | `vsl` | `data/vsl-data.json` |
| 1. Lig | `1lig` | `data/1lig-data.json` |
| 2. Lig | `2lig` | `data/2lig-data.json` |
| CEV Champions League | `cev-cl` | `data/cev-cl-data.json` |
| CEV Cup | `cev-cup` | `data/cev-cup-data.json` |
| CEV Challenge Cup | `cev-challenge` | `data/cev-challenge-cup-data.json` |
| TVF Data | `tvf` | `data/tvf-data.json` |

---

## 🧩 Temel Modüller

### 1. Tahmin Oyunu (`/tahminoyunu`)
- Kullanıcılar maç skorlarını tahmin eder
- Set skorları ile ayrıntılı tahmin
- XP ve coin kazanımı
- Streak sistemi (ardışık doğru tahminler)

### 2. Senaryo Simülasyonu (`/simulation`)
- Maç sonuçlarını manuel belirleme
- Puan tablosu hesaplaması
- "What-if" senaryoları
- Web Worker ile performanslı hesaplama

### 3. Canlı Skor (`/live`)
- TVF'den canlı veri çekimi
- Gerçek zamanlı güncellemeler
- Maç yorumları

### 4. Playoff Bracket (`/playoffs`)
- Görsel bracket tasarımı
- Aşama bazlı ilerleme
- Dinamik eşleşme güncellemeleri

### 5. İstatistikler (`/stats`)
- Takım bazlı istatistikler
- Radar chart görselleştirmesi
- Form analizi (son 5 maç)

### 6. Gamification Sistemi
- XP ve seviye sistemi
- Günlük görevler (quests)
- Başarı rozetleri
- Streak ödülleri
- Liderlik tablosu

---

## 🆕 Yeni Özellikler (v2.0)

### Virtual Economy (Sanal Ekonomi)
- **useWallet Hook**: Coin yönetimi (başlangıç: 500 coin)
- **Shop Sayfası** (`/shop`): 5 kategori, 16+ ürün
  - Boosters (2x XP, Undo Token, vb.)
  - Kozmetikler (Avatar çerçeveleri, temalar)
  - Premium özellikler

### Senaryo Paylaşımı
- **generateScenarioShareUrl**: URL tabanlı senaryo kodlama
- **Scenario Import** (`/scenario/[shareId]`): Paylaşılan senaryoları yükleme
- Sosyal medya paylaşım desteği

### Head-to-Head Düello Sistemi
- **Duel Sayfası** (`/friends/duel`): Arkadaşlarla rekabet
- Stake sistemi (coin bahis)
- Maç bazlı karşılaşmalar

### AI Maç Analizi
- **MatchSummary Bileşeni**: Simülasyon sonrası AI özeti
- Hikaye formatında analiz
- Anahtar anlar timeline'ı
- Öne çıkan istatistikler

### Mobil Navigasyon
- **MobileBottomNav**: 5 sekmeli alt navigasyon
- Mağaza, Görevler, Profil erişimi
- Touch-friendly tasarım

---

## 🗂️ Klasör Yapısı Özeti

```
app/
├── [league]/           # Liga bazlı sayfalar (vsl, 1lig, 2lig, cev-*)
│   ├── gunceldurum/    # Puan tabloları
│   ├── playoffs/       # Playoff bracket
│   ├── stats/          # İstatistikler
│   └── tahminoyunu/    # Tahmin oyunu
├── api/                # API Route handlers
├── components/         # React bileşenleri
│   ├── Calculator/     # Hesap makinesi UI
│   ├── LeagueTemplate/ # Lig şablonları
│   ├── Simulation/     # Simülasyon bileşenleri
│   └── ui/             # Genel UI bileşenleri
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility fonksiyonlar
│   ├── calculation/    # Hesaplama mantığı
│   ├── core/           # Temel utilities
│   ├── data/           # Veri işleme
│   └── supabase/       # Supabase istemcileri
├── types/              # TypeScript tip tanımları
└── workers/            # Web Workers
```

---

## 🔌 Önemli Hook'lar

| Hook | Açıklama |
|------|----------|
| `useWallet` | Coin cüzdanı yönetimi |
| `useMatchSimulation` | Maç simülasyonu motoru |
| `useSimulationEngine` | Web Worker tabanlı hesaplama |
| `usePredictions` | Tahmin CRUD işlemleri |
| `useUserStats` | Kullanıcı XP/Level yönetimi |
| `useLeagueQuery` | React Query ile lig verisi |
| `useLocalStorage` | localStorage senkronizasyonu |
| `useUndoableAction` | Geri al/ileri al desteği |

---

## 🔄 Veri Akışı

```
[JSON Data Files] → [API Routes] → [React Query Cache] → [Components]
                         ↓
                   [Supabase DB]
                         ↓
                   [User Data]
```

---

## 🎨 UI/UX Özellikleri

- **Tema**: Dark/Light mode desteği
- **Responsive**: Mobile-first tasarım
- **Animasyonlar**: Framer Motion entegrasyonu
- **Erişilebilirlik**: WCAG 2.1 uyumlu
- **PWA**: Service Worker ile offline destek

---

## 🧪 Test Yapısı

| Tip | Araç | Konum |
|-----|------|-------|
| Unit Tests | Jest | `__tests__/` |
| Component Tests | React Testing Library | `__tests__/components/` |
| E2E Tests | Playwright | `e2e/` |

---

## 📦 Önemli Bağımlılıklar

```json
{
  "next": "^16.1.1",
  "react": "^19.0.0",
  "typescript": "^5.x",
  "tailwindcss": "^4.x",
  "@tanstack/react-query": "^5.x",
  "@supabase/supabase-js": "^2.x",
  "next-intl": "^3.x",
  "recharts": "^2.x",
  "lucide-react": "^0.x",
  "framer-motion": "^11.x"
}
```

---

## 🚀 Geliştirme Komutları

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Lint kontrolü
npm run lint

# Unit testler
npm test

# E2E testler
npm run test:e2e

# Type kontrolü
npm run type-check
```

---

## 🔐 Ortam Değişkenleri

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=           # AI özellikleri için
VAPID_PRIVATE_KEY=        # Push notifications
NEXT_PUBLIC_VAPID_KEY=
```

---

## 📝 Notlar

1. **Turbopack Uyarısı**: `turbopack.root` ayarı gerekebilir (multiple lockfiles)
2. **Middleware**: Deprecated uyarısı mevcut, `proxy` konvansiyonuna geçiş planlanmalı
3. **Edge Runtime**: Bazı sayfalarda static generation devre dışı

---

## 🔗 Önemli URL'ler

| Sayfa | URL |
|-------|-----|
| Anasayfa | `/anasayfa` |
| VSL Tahmin | `/vsl/tahminoyunu` |
| 1. Lig Puan Durumu | `/1lig/gunceldurum` |
| Canlı Skorlar | `/live` |
| Mağaza | `/shop` |
| Arkadaşlar | `/friends` |
| Düello | `/friends/duel` |
| Profil | `/profile` |
| Liderlik | `/leaderboard` |
| Görevler | `/quests` |

---

*Bu dosya proje yapısının özet referansıdır. Detaylı dosya listesi için `project_tree_structure.md` dosyasına bakınız.*
