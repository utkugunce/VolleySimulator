# VolleySimulator - UI/UX Analiz Dokümanı

> **Bu doküman, harici AI araçlarına yüklenebilecek şekilde hazırlanmıştır.**  
> Proje boyutu: ~2MB+ | Bu doküman: <50KB

---

## 1. Genel Bakış

**Uygulama Türü:** Sports Prediction & Simulation Platform  
**Hedef Kitle:** Türkiye ve Avrupa voleybol taraftarları  
**Platform:** Web (Responsive - Desktop & Mobile)  
**Framework:** Next.js 16 + React + TypeScript  
**Styling:** Tailwind CSS + Custom CSS Variables  

---

## 2. Renk Sistemi

### 2.1 CSS Variables (globals.css)

```css
:root {
  /* Backgrounds */
  --background: #0f172a;        /* Slate 950 */
  --foreground: #f1f5f9;        /* Slate 100 */
  --surface-primary: #1e293b;   /* Slate 800 */
  --surface-secondary: #334155; /* Slate 700 */
  
  /* Text */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  /* Brand Colors */
  --color-primary: #10b981;      /* Emerald 500 */
  --color-primary-light: #34d399;
  --color-primary-dark: #059669;
  --color-accent: #f59e0b;       /* Amber 500 */
  
  /* Glow Effects */
  --glow-primary: rgba(16, 185, 129, 0.4);
  --glow-accent: rgba(245, 158, 11, 0.4);
  --glow-blue: rgba(59, 130, 246, 0.4);
}
```

### 2.2 Tailwind Extension (tailwind.config.ts)

```typescript
colors: {
  background: 'var(--background)',
  surface: {
    DEFAULT: 'var(--surface-primary)',
    secondary: 'var(--surface-secondary)',
    glass: 'var(--surface-glass)',
  },
  primary: {
    DEFAULT: 'var(--color-primary)',
    light: 'var(--color-primary-light)',
    dark: 'var(--color-primary-dark)',
  },
  accent: {
    DEFAULT: 'var(--color-accent)',
    light: 'var(--color-accent-light)',
    dark: 'var(--color-accent-dark)',
  },
}
```

### 2.3 Lig-Bazlı Renk Kodları

| Lig | Primary Color | Hex/Class |
|-----|---------------|-----------|
| VSL (Sultanlar Ligi) | Rose/Red | `rose-500` (#f43f5e) |
| CEV Şampiyonlar Ligi | Blue | `blue-500` (#3b82f6) |
| 1. Lig | Emerald/Green | `emerald-500` (#10b981) |
| 2. Lig | Amber/Orange | `amber-500` (#f59e0b) |

---

## 3. Tipografi

### 3.1 Font Stack

```css
font-family: var(--font-geist-sans), Arial, sans-serif;
font-family: var(--font-geist-mono), monospace; /* Code blocks */
```

**Font:** Geist (Vercel Font)

### 3.2 Tipografik Hiyerarşi

| Element | Class/Style | Örnek Kullanım |
|---------|-------------|----------------|
| Page Title | `text-2xl font-bold` | "Sultanlar Ligi Play-Off" |
| Section Header | `text-xl font-bold` | "Play-Off 1. Etap (1-4)" |
| Card Title | `text-lg font-bold` | "Yarı Final" |
| Body Text | `text-sm text-slate-300` | Açıklama metinleri |
| Label | `text-xs uppercase tracking-wider` | "1. MAÇ" |
| Muted | `text-xs text-slate-500` | Yardımcı bilgiler |

---

## 4. UI Bileşenleri

### 4.1 Bileşen Envanteri (26 bileşen)

| Bileşen | Dosya | Kullanım |
|---------|-------|----------|
| **Navbar** | `Navbar.tsx` (359 satır) | Global navigasyon, lig seçimi, profil |
| **PageHeader** | `PageHeader.tsx` | Sayfa başlıkları, lig linkleri |
| **TeamAvatar** | `TeamAvatar.tsx` | Takım logoları (circular) |
| **XPBar** | `XPBar.tsx` | Level progress göstergesi |
| **Toast** | `Toast.tsx` | Bildirimler (success/error/warning) |
| **Confetti** | `Confetti.tsx` | Kutlama animasyonu |
| **ThemeToggle** | `ThemeToggle.tsx` | Dark/Light mod değiştirici |
| **BracketView** | `BracketView.tsx` | Playoff bracket görünümü |
| **StatsCard** | `StatsCard.tsx` | İstatistik kartları |
| **Achievements** | `Achievements.tsx` | Rozet galerisi |
| **QuestPanel** | `QuestPanel.tsx` | Günlük görevler |
| **TutorialModal** | `TutorialModal.tsx` | Onboarding modal |

### 4.2 Kart Tasarımı (Card Pattern)

```jsx
<div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
  {/* Header */}
  <div className="border-b border-slate-700/50 pb-2 mb-3">
    <span className="text-sm font-bold text-white">{title}</span>
  </div>
  {/* Content */}
  <div className="space-y-2">
    {content}
  </div>
</div>
```

**Variants:**
- Default: `bg-slate-800 border-slate-700`
- Highlighted: `bg-emerald-500/20 border-emerald-500/30`
- Warning: `bg-rose-500/10 border-rose-500/20`
- Glass: `bg-slate-900/60 backdrop-blur-xl`

### 4.3 Button Patterns

**Primary Button:**
```jsx
<button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 
  text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 
  hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] 
  transition-all">
  Giriş Yap
</button>
```

**Secondary Button:**
```jsx
<button className="px-3 py-1.5 bg-slate-800 border border-slate-700 
  text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
  İptal
</button>
```

**Score Pill Button:**
```jsx
<button className={`px-2 py-1 text-xs rounded border transition-all
  ${isSelected 
    ? 'bg-emerald-600 border-emerald-400 text-white font-bold shadow-glow-primary' 
    : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'}`}>
  3-0
</button>
```

---

## 5. Layout Patterns

### 5.1 Page Layout

```jsx
<main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
  <div className="max-w-7xl mx-auto space-y-8">
    <PageHeader title="..." subtitle="..." />
    {/* Page Content */}
  </div>
</main>
```

### 5.2 Grid Sistemleri

| Pattern | Sınıflar | Kullanım |
|---------|----------|----------|
| 2-column | `grid md:grid-cols-2 gap-6` | Playoff bracket |
| 4-column | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3` | Final standings |
| Auto-fit | `grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))]` | Lig kartları |

### 5.3 Responsive Breakpoints

```
sm: 640px   (Mobil landscape)
md: 768px   (Tablet)
lg: 1024px  (Desktop)
xl: 1280px  (Large desktop)
```

---

## 6. Animasyonlar & Efektler

### 6.1 Tanımlı Animasyonlar (globals.css)

```css
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes pulse-glow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
```

### 6.2 Utility Sınıfları

| Sınıf | Efekt |
|-------|-------|
| `.animate-fade-in` | 0.15s fadeIn |
| `.animate-slide-up` | 0.15s slideUp |
| `.animate-shimmer` | 2s shimmer infinite |
| `.animate-float` | 4s float infinite |
| `.hover-lift:hover` | translateY(-2px) |
| `.hover-glow:hover` | emerald glow shadow |
| `.active-press:active` | scale(0.97) |

### 6.3 Glow Efektleri

```css
.glow-emerald { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
.glow-amber { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
.glow-rose { box-shadow: 0 0 20px rgba(244, 63, 94, 0.3); }
```

---

## 7. Tema Sistemi (Dark/Light)

### 7.1 Tema Değişkeni

```jsx
// ThemeToggle.tsx
const [theme, setTheme] = useState('dark');
document.documentElement.setAttribute('data-theme', theme);
```

### 7.2 Light Tema Override'ları

Light tema, CSS variable'ları override eder:
```css
[data-theme="light"] {
  --background: #f3f5f8;
  --foreground: #0f172a;
  --surface-primary: #ffffff;
  --color-primary: #059669; /* Darker emerald for contrast */
}
```

---

## 8. Aksiyon Çubuğu (Action Bar)

Tahmin oyunu sayfalarındaki tutarlı aksiyon çubuğu:

```jsx
<div className="flex flex-wrap gap-2 items-center">
  {/* Group Selector */}
  <select className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg">
    <option>A Grubu</option>
    <option>B Grubu</option>
  </select>
  
  {/* Auto Simulate Dropdown */}
  <div className="relative">
    <button className="px-3 py-2 bg-emerald-600 text-white rounded-lg">
      Otomatik
    </button>
    {/* Dropdown menu */}
  </div>
  
  {/* Save/Load */}
  <button>Kaydet</button>
  <button>Yükle</button>
  
  {/* Reset Dropdown */}
  <button className="text-rose-400">Sıfırla</button>
</div>
```

---

## 9. Gamification UI

### 9.1 XP Bar

```jsx
<div className="bg-slate-800 rounded-full h-2 overflow-hidden">
  <div 
    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all"
    style={{ width: `${(xp / nextLevelXP) * 100}%` }}
  />
</div>
```

### 9.2 Level Badge

```jsx
<div className="flex items-center gap-2">
  <span className="text-emerald-400 font-bold">Lv.{level}</span>
  <span className="text-slate-400 text-xs">{getLevelTitle(level)}</span>
</div>
```

Level Titles:
- 1: Çaylak
- 5: Amatör
- 10: Uzman
- 15: Profesyonel
- 20: Efsane

---

## 10. Mobil Optimizasyonlar

### 10.1 Touch Targets

```css
@media (max-width: 768px) {
  .touch-target { min-height: 44px; min-width: 44px; }
}
```

### 10.2 Bottom Navigation

Mobilde sabit alt navigasyon çubuğu (Navbar.tsx içinde):
```jsx
<nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-50 md:hidden">
  <div className="flex justify-around py-2">
    {/* Ana Sayfa, Ligler, Tahmin, Profil */}
  </div>
</nav>
```

---

## 11. Erişilebilirlik (a11y)

### 11.1 Mevcut Durumu

- ✅ Semantic HTML (`main`, `nav`, `section`)
- ✅ Focus-visible destekli butonlar
- ✅ Renk kontrastı (WCAG AA dark tema)
- ⚠️ ARIA labels eksik bazı interaktif elementlerde
- ⚠️ Keyboard navigation kısmen destekli

### 11.2 İyileştirme Önerileri

1. Tüm butolara `aria-label` eklenmeli
2. Modal'lara focus trap eklenmeli
3. Skip-to-content linki eklenmeli
4. Screen reader için live regions eklenmeli

---

## 12. Performance Notları

### 12.1 Mevcut Optimizasyonlar

- Next.js App Router (RSC desteği)
- Image lazy loading
- Font preloading (Geist)
- Vercel Analytics + Speed Insights

### 12.2 İyileştirme Önerileri

1. Component lazy loading (`React.lazy`)
2. Virtual scrolling (uzun listeler için)
3. Skeleton screens (mevcut ama daha fazla kullanılabilir)

---

## 13. Bilinen UX Sorunları

1. **Uzun fixture listeleri** - Scroll yorgunluğu yaratabilir
2. **Grup seçici** - Mobilde dropdown yerine swipe tabs daha iyi olabilir
3. **Reset confirmation** - Şu an sadece gruba özel, "Tümünü sıfırla" için extra confirm gerekebilir
4. **Loading states** - Bazı sayfalarda skeleton eksik
5. **Empty states** - Veri olmadığında mesaj yetersiz

---

## 14. Dosya Yapısı Özeti

```
app/
├── components/         # 26 UI bileşeni
│   ├── Navbar.tsx     # 359 satır - Ana navigasyon
│   ├── PageHeader.tsx # Header + lig linkleri
│   ├── TeamAvatar.tsx # Takım logoları
│   ├── XPBar.tsx      # Gamification progress
│   ├── Toast.tsx      # Bildirimler
│   └── ...
├── globals.css        # 835 satır - Tema, animasyonlar
├── tailwind.config.ts # 56 satır - Renk sistemi extension
├── vsl/              # Sultanlar Ligi sayfaları
├── cev-cl/           # CEV CL sayfaları  
├── 1lig/             # 1. Lig sayfaları
└── 2lig/             # 2. Lig sayfaları
```

---

**Son Güncelleme:** 2 Ocak 2026
