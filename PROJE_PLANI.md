# Online Radio Sitesi - Proje Planı

## 📋 Genel Bakış

Radio.co benzeri modern bir online radyo sitesi geliştirilecek. Proje, pratik projesindeki teknolojiler kullanılarak geliştirilecek ve shadcn UI bileşenleri ile modern bir arayüz oluşturulacak.

---

## 🎯 Proje Yapısı

```
lforadio/
├── f/                          # Frontend klasörü
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Shadcn UI bileşenleri
│   │   │   │   ├── button.tsx
│   │   │   │   ├── navigation-menu.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx      # Üst menü/navbar
│   │   │   │   └── Footer.tsx
│   │   │   ├── player/
│   │   │   │   ├── RadioPlayer.tsx      # Ana radyo player bileşeni
│   │   │   │   ├── PlayerControls.tsx   # Play/pause, volume kontrolleri
│   │   │   │   ├── StationList.tsx      # Radyo istasyonları listesi
│   │   │   │   └── EmbeddedPlayer.tsx  # Embedded player widget
│   │   │   └── sections/
│   │   │       ├── Hero.tsx        # Ana hero bölümü
│   │   │       └── ...
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Platform.tsx
│   │   │   ├── Services.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── utils.ts
│   │   │   └── api.ts            # Axios konfigürasyonu
│   │   ├── hooks/
│   │   │   └── useApi.ts         # React Query hooks
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

---

## 🛠️ Teknoloji Stack'i

### Frontend Teknolojileri (Pratik projesinden)
- **React** v19.1.0
- **TypeScript** v5.8.3
- **Vite** v6.3.5
- **Tailwind CSS** v4.1.10
- **Shadcn UI** (Radix UI tabanlı)
- **Axios** v1.10.0
- **React Router** v7.6.2
- **TanStack React Query** v5.80.7
- **Lucide React** (ikonlar)
- **class-variance-authority** (component varyantları)
- **clsx** & **tailwind-merge** (stil birleştirme)

---

## 📐 Tasarım Özellikleri (Resimden Çıkarılanlar)

### 1. Üst Navigasyon Menüsü (Header)
- **Arka Plan**: Koyu gri/siyah, ana gradyandan daha koyu
- **Logo**: Sol tarafta, stilize "R" simgesi + "Radio.co" metni
- **Navigasyon Linkleri**: 
  - Platform
  - Services
  - Customers
  - Learn
  - Why Us
  - Pricing
- **Sağ Taraf Butonları**:
  - Log In (text link)
  - Try Free (kırmızı dolgulu buton)
  - Book Demo (outline buton)

### 2. Hero Bölümü
- **Arka Plan**: Kırmızıdan mor/koyu maviye geçiş yapan gradyan
- **Başlık**: Büyük, kalın, beyaz metin
- **Alt Başlık**: Daha küçük açıklama metni
- **CTA Butonları**: Try for Free ve Book Demo

### 3. Embedded Radio Player'lar
- **Player Widget'ları**: Sayfalarda embedded olarak kullanılacak
- **Özellikler**:
  - Play/Pause kontrolü
  - Volume kontrolü
  - Radyo istasyonu bilgisi (isim, şu an çalan şarkı)
  - Çoklu radyo kanalı desteği
  - Stream URL yönetimi
- **Tasarım**: Modern, karanlık tema ile uyumlu
- **Responsive**: Mobil ve desktop uyumlu

### 4. Genel Tasarım
- Karanlık tema
- Modern ve şık görünüm
- Responsive tasarım
- Gradient arka planlar
- Embedded player'lar için özel widget tasarımı

---

## 🚀 Geliştirme Adımları

### Faz 1: Proje Kurulumu
1. ✅ Vite + React + TypeScript projesi oluştur
2. ✅ Tailwind CSS kurulumu ve konfigürasyonu
3. ✅ Shadcn UI kurulumu ve başlangıç bileşenleri
4. ✅ Temel klasör yapısını oluştur
5. ✅ Path alias'ları ayarla (@/src)

### Faz 2: Shadcn UI Bileşenleri
1. ✅ Button bileşeni (zaten var)
2. ✅ Navigation Menu bileşeni ekle
3. ✅ Gerekli diğer shadcn bileşenleri

### Faz 3: Layout Bileşenleri
1. ✅ Header/Navbar bileşeni
   - Logo alanı
   - Navigation Menu entegrasyonu
   - Butonlar (Log In, Try Free, Book Demo)
   - Responsive hamburger menü
2. ✅ Footer bileşeni (opsiyonel)

### Faz 4: Radio Player Bileşenleri
1. ✅ RadioPlayer ana bileşeni
   - HTML5 Audio API entegrasyonu
   - Stream URL yönetimi
   - Durum yönetimi (playing, paused, loading)
2. ✅ PlayerControls bileşeni
   - Play/Pause butonu
   - Volume slider
   - Loading indicator
   - Hata yönetimi
3. ✅ StationList bileşeni
   - Radyo istasyonları listesi
   - İstasyon seçimi
   - Şu an çalan bilgisi
4. ✅ EmbeddedPlayer widget
   - Sayfalara gömülebilir player
   - Kompakt tasarım
   - Responsive yapı

### Faz 5: Ana Sayfa Bileşenleri
1. ✅ Hero bölümü
   - Gradient arka plan
   - Başlık ve alt başlık
   - CTA butonları
2. ✅ Embedded player bölümü
   - Ana sayfada player widget
   - Popüler radyo istasyonları
3. ✅ Diğer bölümler (ileride eklenecek)

### Faz 6: Routing
1. ✅ React Router kurulumu
2. ✅ Ana sayfa route'u
3. ✅ Diğer sayfa route'ları (Platform, Services, vb.)
4. ✅ Player sayfası route'u (opsiyonel)

### Faz 7: API Entegrasyonu (İleride)
1. ✅ Axios konfigürasyonu
2. ✅ React Query setup
3. ✅ API hook'ları
4. ✅ Radyo istasyonları API'si
5. ✅ Şu an çalan şarkı bilgisi API'si (metadata)

### Faz 8: Stil ve Tema
1. ✅ Tailwind konfigürasyonu
2. ✅ Renk paleti (karanlık tema)
3. ✅ Gradient stilleri
4. ✅ Responsive breakpoint'ler

---

## 📦 Kurulacak Paketler

### Temel Paketler
```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.2",
    "axios": "^1.10.0",
    "@tanstack/react-query": "^5.80.7",
    "tailwindcss": "^4.1.10",
    "@tailwindcss/vite": "^4.1.10",
    "lucide-react": "^0.539.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react": "^4.4.1",
    "typescript": "~5.8.3",
    "vite": "^6.3.5"
  }
}
```

### Shadcn UI Paketleri (Radix UI)
- `@radix-ui/react-navigation-menu` - Navigation menu için
- `@radix-ui/react-slot` - Button için (zaten var)
- Diğer gerekli Radix UI paketleri

---

## 🎨 Tasarım Detayları

### Renk Paleti
- **Ana Kırmızı**: `#EF4444` veya `#DC2626`
- **Mor/Mavi**: `#6366F1` veya `#4F46E5`
- **Koyu Arka Plan**: `#0F172A` veya `#1E293B`
- **Navbar Arka Plan**: `#020617` veya `#0A0A0A`
- **Beyaz Metin**: `#FFFFFF`
- **Gri Metin**: `#94A3B8`

### Gradient
```css
background: linear-gradient(to right, #EF4444, #6366F1);
```

### Typography
- **Ana Başlık**: Bold, 48-64px
- **Alt Başlık**: Regular, 18-24px
- **Nav Linkler**: Medium, 16px
- **Buton Metinleri**: Medium, 14-16px

---

## 📝 Shadcn Navigation Menu Kullanımı

Shadcn'in navigation-menu bileşeni şu şekilde kullanılacak:

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
```

Menü yapısı:
- Platform (dropdown olabilir)
- Services
- Customers
- Learn
- Why Us
- Pricing

---

## ✅ Kontrol Listesi

### Kurulum
- [ ] Vite projesi oluşturuldu
- [ ] Tailwind CSS kuruldu ve yapılandırıldı
- [ ] Shadcn UI kuruldu
- [ ] Gerekli paketler yüklendi
- [ ] Path alias'lar ayarlandı

### Bileşenler
- [ ] Button bileşeni hazır
- [ ] Navigation Menu bileşeni eklendi
- [ ] Header bileşeni oluşturuldu
- [ ] Hero bileşeni oluşturuldu
- [ ] RadioPlayer bileşeni oluşturuldu
- [ ] PlayerControls bileşeni oluşturuldu
- [ ] StationList bileşeni oluşturuldu
- [ ] EmbeddedPlayer widget oluşturuldu

### Stil
- [ ] Karanlık tema uygulandı
- [ ] Gradient arka planlar eklendi
- [ ] Responsive tasarım yapıldı
- [ ] Renk paleti uygulandı

### Routing
- [ ] React Router kuruldu
- [ ] Ana sayfa route'u çalışıyor
- [ ] Diğer sayfa route'ları hazır

### Player Özellikleri
- [ ] HTML5 Audio API entegrasyonu
- [ ] Stream URL yönetimi
- [ ] Play/Pause fonksiyonları
- [ ] Volume kontrolü
- [ ] Çoklu istasyon desteği
- [ ] Hata yönetimi ve retry mekanizması
- [ ] Loading state'leri
- [ ] Metadata desteği (şu an çalan şarkı)

---

## 🎵 Radio Player Özellikleri

### Teknik Detaylar
- **HTML5 Audio API**: Native browser audio desteği
- **Stream Formatları**: MP3, AAC, OGG, HLS desteği
- **State Management**: React hooks ile durum yönetimi
- **Error Handling**: Stream hatalarında retry mekanizması
- **Metadata**: Şu an çalan şarkı bilgisi (ICY metadata)

### Player Bileşen Yapısı
```tsx
// RadioPlayer.tsx - Ana player bileşeni
- useAudio hook ile stream yönetimi
- Play/pause state yönetimi
- Volume kontrolü
- Error handling

// PlayerControls.tsx - Kontrol butonları
- Play/Pause butonu
- Volume slider
- Loading spinner
- Error mesajları

// StationList.tsx - İstasyon listesi
- Radyo istasyonları grid/list görünümü
- İstasyon seçimi
- Şu an çalan bilgisi gösterimi

// EmbeddedPlayer.tsx - Widget
- Kompakt player widget
- Sayfalara gömülebilir
- Minimal tasarım
```

### Örnek Kullanım
```tsx
// Sayfalarda embedded player kullanımı
<EmbeddedPlayer 
  stationId="radio-1"
  streamUrl="https://stream.example.com/radio1.mp3"
  stationName="Radio Station 1"
/>
```

---

## 🔄 Sonraki Adımlar

1. Proje kurulumunu başlat
2. Shadcn bileşenlerini ekle
3. Header bileşenini oluştur
4. Hero bölümünü tasarla
5. Radio Player bileşenlerini oluştur
6. Embedded player widget'ını tasarla
7. Responsive tasarımı tamamla
8. İçerik sayfalarını ekle
9. Player'ları sayfalara entegre et

---

## 📚 Referanslar

- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Radix UI Navigation Menu](https://www.radix-ui.com/primitives/docs/components/navigation-menu)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)

---

---

## 📻 Radio Player Teknolojileri

### Gerekli Paketler
- **HTML5 Audio API** (Native, ek paket gerekmez)
- **react-use** (opsiyonel, audio hook'ları için)
- **zustand** veya **React Context** (global player state için)

### Stream Formatları
- MP3 Stream: `https://example.com/stream.mp3`
- AAC Stream: `https://example.com/stream.aac`
- HLS Stream: `https://example.com/stream.m3u8` (daha gelişmiş)
- OGG Stream: `https://example.com/stream.ogg`

### Metadata Desteği
- ICY Metadata: Stream'den gelen şarkı bilgisi
- API Entegrasyonu: Backend'den şu an çalan bilgisi
- Fallback: İstasyon adı gösterimi

---

**Not**: Bu plan, resimdeki tasarıma ve pratik projesindeki teknolojilere göre hazırlanmıştır. Embedded player'lar Radio.co benzeri şekilde sayfalara gömülecektir. Geliştirme sürecinde gerekli güncellemeler yapılabilir.
