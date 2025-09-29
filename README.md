# Zenotika - Rumah Digital

🏠 **Website untuk Rumah Digital Zenotika** - Platform digital yang dirancang khusus untuk 450+ mahasiswa Jurusan Ilmu Komputer Universitas Komputer Indonesia (UNIKOM).

![Zenotika Homepage](https://github.com/user-attachments/assets/2e606710-0fa1-42f5-8294-2f4f93738794)

## 🎯 Tujuan

Zenotika adalah platform digital yang berfungsi sebagai:
- **Media Informasi** - Portal informasi terpadu untuk mahasiswa
- **Media Ajar** - Platform pembelajaran interaktif dengan materi berkualitas
- **Komunitas** - Membangun komunitas mahasiswa yang saling mendukung

## ✨ Fitur Utama

### 🤖 Karakter 3D Interaktif
- Karakter 3D sebagai ikon utama Zenotika
- Animasi floating dan interaksi mouse
- Responsif di semua perangkat

### 📱 Fully Responsive Design
- Optimized untuk desktop, tablet, dan mobile
- Mobile-first approach
- Hamburger menu untuk navigasi mobile

![Mobile Version](https://github.com/user-attachments/assets/e0950831-9e4c-43fa-b446-b4a0b5d822dc)

### 🎨 Modern UI/UX
- Gradient colors dengan tema blue dan orange
- Smooth animations dan transitions
- Interactive elements dengan hover effects
- Typography menggunakan Orbitron dan Inter fonts

### ⚡ Performance Optimized
- Pure HTML, CSS, dan JavaScript (no frameworks)
- Lightweight dan fast loading
- Progressive Web App ready
- SEO optimized

## 🛠️ Tech Stack

**Frontend:**
- HTML5 (Semantic markup)
- CSS3 (Grid, Flexbox, 3D Transforms, Animations)
- Vanilla JavaScript (ES6+)
- Google Fonts (Orbitron, Inter)

**Features:**
- CSS 3D Transforms untuk karakter
- CSS Grid & Flexbox untuk layout
- Intersection Observer untuk scroll animations
- Smooth scrolling navigation
- Mobile responsive design

## 🚀 Quick Start

1. **Clone repository:**
   ```bash
   git clone https://github.com/Andhika-Rey/zen.git
   cd zen
   ```

2. **Jalankan local server:**
   ```bash
   # Menggunakan Python
   python3 -m http.server 8000
   
   # Atau menggunakan Node.js
   npx serve .
   
   # Atau menggunakan Live Server di VS Code
   ```

3. **Buka di browser:**
   ```
   http://localhost:8000
   ```

## 📁 Struktur File

```
zen/
├── index.html          # Main HTML file
├── styles.css          # CSS styles dan animations
├── script.js           # JavaScript functionality
└── README.md           # Documentation
```

## 🎮 Interactive Features

- **3D Character Animation** - Karakter floating dengan animasi kontinyu
- **Mouse Interaction** - Karakter merespons pergerakan mouse
- **Click Animation** - Karakter berputar 360° saat diklik
- **Smooth Navigation** - Scroll smooth ke section yang dipilih
- **Form Animation** - Interactive form dengan feedback visual
- **Easter Egg** - Konami code untuk surprise effect

## 📱 Responsive Breakpoints

- **Desktop:** ≥ 1200px
- **Tablet:** 768px - 1199px
- **Mobile:** ≤ 767px
- **Small Mobile:** ≤ 480px

## 🎨 Color Palette

```css
Primary: #00d4ff (Cyan blue)
Secondary: #0066cc (Dark blue)
Accent: #ff6b35 (Orange)
Dark BG: #0a0e27 (Navy)
Light BG: #f8faff (Light blue)
```

## 🌐 Deployment

Website ini sudah siap untuk deploy ke:
- **GitHub Pages** (Gratis)
- **Netlify** (Gratis)
- **Vercel** (Gratis)
- **Firebase Hosting** (Gratis)

### Deploy ke GitHub Pages:
1. Push code ke repository GitHub
2. Ke Settings > Pages
3. Pilih source branch (main)
4. Website akan available di `https://andhika-rey.github.io/zen/`

## 🔔 Announcement & 📅 Events (Dinamis)

### Pengumuman Mingguan
Edit `data/config.json` bagian `announcements`:

```
{
   "announcements": [
      { "message": "Pendaftaran mentoring dibuka!", "link": "https://...", "until": "2025-12-31" }
   ]
}
```

Pengumuman bisa ditutup. Pesan yang sama tidak akan tampil lagi (disimpan di localStorage pengguna).

### Acara Dinamis
Sumber default: `data/events.json` dengan format:

```
[
   { "date": "2025-10-05", "title": "Judul", "description": "Deskripsi", "location": "Tempat", "link": "https://..." }
]
```

Alternatif: Google Sheets (CSV). Ubah `data/config.json`:

```
{
   "events": {
      "source": "csv",
      "csvUrl": "https://docs.google.com/spreadsheets/d/ID/export?format=csv"
   }
}
```

Kolom CSV: `date,title,description,location,link`.

## 📚 Materi Ajar
Halaman awal di folder `materials/`:
- `materials/program-dasar.html`
- `materials/asd.html`
- `materials/basis-data.html`
- `materials/web.html`

Silakan ganti tautan Modul/Latihan ke resource asli (PDF/GDrive/dsb).

## ⚙️ PWA & Cache
`sw.js` mencache halaman utama, materi, dan data JSON. Jika menambah file penting, update array `ASSETS` dan naikkan `CACHE_NAME`.

## 🚀 Netlify
1. Hubungkan repo ke Netlify.
2. Build command: kosong. Publish directory: `.` (dikontrol `netlify.toml`).
3. Deploy akan melayani SPA fallback ke `index.html`.

## 🎓 Target Audience

- 450+ Mahasiswa Jurusan Ilmu Komputer UNIKOM
- Dosen dan staff akademik
- Calon mahasiswa dan alumni
- Komunitas developer Indonesia

## 📞 Contact & Social Media

- **Instagram:** [@zenotika](https://www.instagram.com/zenotika/)
- **Email:** info@zenotika.id
- **Location:** Universitas Komputer Indonesia, Bandung

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:
1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

Made with ❤️ for UNIKOM Computer Science Students

---

**Zenotika Digital House** - Membangun masa depan digital mahasiswa Ilmu Komputer Indonesia