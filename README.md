# ✨ Zenotika — Digital Aurora

_Platform digital untuk komunitas Ilmu Komputer UNIKOM. Menyatukan materi belajar, kolaborasi komunitas, dan pengalaman PWA modern dalam satu tempat._

<p align="center">
    <a href="https://zenotika.unikom.ac.id/">
        <img alt="Zenotika demo badge" src="https://img.shields.io/badge/demo-live-success" />
    </a>
    <a href="LICENSE">
        <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg" />
    </a>
    <a href="CONTRIBUTING.md">
        <img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" />
    </a>
</p>

---

## 📌 Ringkasan

- **Aurora Design System** dengan glassmorphism, animasi halus, dan dukungan light/dark mode.
- **Konten dinamis** (pengumuman, event, proyek komunitas) di-load dari berkas JSON dan mudah dihubungkan ke Headless CMS.
- **Performa & aksesibilitas** jadi prioritas: Service Worker adaptif, debounce pencarian, `aria-live`, dan `:focus-visible`.
- **Dokumentasi lengkap** (performa, deployment, roadmap) untuk memastikan tim baru bisa beradaptasi cepat.

> 🇮🇩 Dokumentasi utama tersedia dalam bahasa Indonesia. Istilah teknis populer dipertahankan agar tetap familier bagi developer.

---

## 🧭 Daftar Isi

1. [Fitur Utama](#-fitur-utama)
2. [Mulai Cepat](#-mulai-cepat)
3. [Struktur Proyek](#-struktur-proyek)
4. [Detail Arsitektur](#-detail-arsitektur)
5. [Dokumentasi Lengkap](#-dokumentasi-lengkap)
6. [Roadmap](#-roadmap)
7. [Kontribusi](#-kontribusi)
8. [Lisensi & Kontak](#-lisensi--kontak)

---

## 🌈 Fitur Utama

### 1. Pengalaman Visual
- Digital Aurora theme dengan gradien animasi dan tipografi Syne/Manrope.
- Layout responsif berbasis CSS Grid & Flexbox, diuji hingga viewport < 360px.
- Toggle light/dark mode dengan penyimpanan preferensi di `localStorage`.

### 2. Konten & Pencarian
- Data pengumuman dan komunitas dimuat dari `data/announcements.json` & `data/community.json`.
- Pencarian real-time dengan debounce 300 ms dan sanitasi konten untuk keamanan.
- Filter tag dinamis lengkap dengan indikator fokus, status aktif, dan ARIA live region.

### 3. Performa & PWA
- Service Worker (`sw.js`) memisahkan cache statis/dinamis untuk menjaga data terbaru.
- Manifest PWA (`manifest.json`) siap untuk pemasangan ke home screen.
- Panduan optimasi Core Web Vitals dan lazy loading disiapkan di _Performance Guide_.

### 4. Aksesibilitas & UX
- Fokus visual (`:focus-visible`) dan kontras warna yang memenuhi target WCAG AA.
- Empty state ramah pengguna untuk hasil pencarian dan fallback konten saat fetch gagal.
- Komponen interaktif menggunakan semantic HTML dan ARIA yang relevan.

---

## ⚡ Mulai Cepat

### Prasyarat
- Git & browser modern.
- Server statis lokal: Live Server (VS Code), `python -m http.server`, atau `npx serve`.

### Jalankan Secara Lokal

```bash
git clone https://github.com/Andhika-Rey/zen.git
cd zen

# opsi 1: Python 3
python -m http.server 3000

# opsi 2: Node.js (via serve)
npx serve -l 3000

# buka http://localhost:3000
```

> Tip: Saat menguji Service Worker gunakan _hard refresh_ (Ctrl + Shift + R) agar cache diperbarui.

### Alur Kontribusi Cepat
1. Buat branch: `git checkout -b feature/nama-fitur`.
2. Lakukan perubahan & perbarui dokumentasi bila relevan.
3. Commit: `git commit -m "feat: deskripsi singkat"`.
4. Push & buka Pull Request.

Panduan lengkap tersedia di [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 🗂️ Struktur Proyek

```
zen/
├── index.html            # Halaman utama & landing
├── community.html        # Showcase komunitas + filter/tag
├── styles.css            # Styling global, tema, responsivitas
├── script.js             # Logika UI, fetch JSON, theme switcher
├── sw.js                 # Service Worker & strategi caching
├── manifest.json         # Konfigurasi PWA
│
├── data/
│   ├── announcements.json
│   └── community.json
│
├── materials/            # Materi kuliah statis
│   ├── program-dasar.html
│   ├── asd.html
│   ├── basis-data.html
│   └── web.html
│
├── docs/                 # Referensi teknis & operasional
│   ├── DEPLOYMENT.md
│   ├── PERFORMANCE.md
│   ├── ROADMAP.md
│   └── ...
│
├── .github/workflows/
│   └── pages.yml         # Deploy otomatis ke GitHub Pages
├── CHANGELOG.md
├── IMPROVEMENTS.md
├── netlify.toml
└── robots.txt / sitemap.xml / icon.svg
```

---

## 🧩 Detail Arsitektur

- **Vanilla stack**: HTML, CSS, dan JavaScript ES2020+ tanpa framework berat.
- **Data-driven UI**: Konten dinamis disajikan dari folder `data/`, mudah dipindahkan ke API/CMS.
- **Service Worker adaptif**: Cache statis (`static-v3`) dan dinamis (`dynamic-v3`) dengan fallback offline.
- **A11y-first**: Keyboard navigation, ARIA announcements, dan kontras warna konsisten.

---

## 📚 Dokumentasi Lengkap

- [roadmap.md](docs/roadmap.md) — Peta jalan pengembangan.
- [PERFORMANCE.md](docs/PERFORMANCE.md) — Checklist optimasi Core Web Vitals & PWA.
- [IMAGE_OPTIMIZATION.md](docs/IMAGE_OPTIMIZATION.md) — Panduan konversi WebP & responsive images.
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) — Panduan GitHub Pages & Netlify.
- [IMPROVEMENTS.md](IMPROVEMENTS.md) — Ide fitur lanjutan & tugas backlog.
- [CHANGELOG.md](CHANGELOG.md) — Riwayat rilisan.

---

## 🛣️ Roadmap

### Selesai
- ✅ Redesign Digital Aurora & tema gelap/terang.
- ✅ Halaman komunitas dengan pencarian dan filter tag.
- ✅ Audit aksesibilitas & penambahan ARIA/focus state.
- ✅ Optimasi Service Worker dan meta SEO dasar.

### Sedang Berjalan
- ✅ Optimasi aset (WebP pipeline, lazy loading, responsive images).
- ⏳ Integrasi analytics & error tracking.
- ⏳ Build automation untuk minifikasi CSS/JS.

### Berikutnya
- ⭕ Integrasi Headless CMS (Strapi/Contentful).
- ⭕ Pencarian lanjutan (lunr.js/Algolia).
- ⭕ Otentikasi pengguna & pelacakan progres belajar.

Status lengkap & prioritas terbaru selalu diperbarui di [CHANGELOG.md](CHANGELOG.md) dan [roadmap.md](docs/roadmap.md).

---

## 🤝 Kontribusi

Kami terbuka untuk kolaborasi! Sebelum mengirim PR:
- Gunakan gaya commit konvensional (`feat:`, `fix:`, `docs:`) agar riwayat rapi.
- Tambahkan catatan uji manual (desktop & mobile) di deskripsi PR.
- Untuk perubahan besar, buka issue terlebih dahulu untuk diskusi.

Butuh ide? Lihat [IMPROVEMENTS.md](IMPROVEMENTS.md) untuk daftar tugas yang siap dikerjakan.

---

## 📜 Lisensi & Kontak

- **Lisensi**: [MIT](LICENSE)
- **Demo**: [zenotika.unikom.ac.id](https://zenotika.unikom.ac.id/) _(fallback sementara: [andhika-rey.github.io/zen](https://andhika-rey.github.io/zen/))_
- **GitHub**: [@Andhika-Rey](https://github.com/Andhika-Rey)
- **Email**: support@zenotika.unikom.ac.id _(opsional, WIP)_

Berikan ⭐️ jika proyek ini membantu Anda — dukungan kecil yang berdampak besar bagi komunitas! 🙌

---

_Dibangun dengan 💙 untuk pendidikan dan kolaborasi digital._
# 🌟 Zenotika - Digital Aurora

> Platform digital modern untuk Mahasiswa Ilmu Komputer Universitas Komputer Indonesia

[![GitHub Pages](https://img.shields.io/badge/demo-live-success)](https://zenotika.unikom.ac.id/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

![Zenotika Preview](https://via.placeholder.com/1200x630/0B0B1A/00c3ff?text=Zenotika+2025)

---

## ✨ Features

### 🎨 Modern Design
- **Digital Aurora Theme** - Glassmorphism dengan animated gradients
- **Light/Dark Mode** - Toggle tema dengan preferensi tersimpan
- **Responsive Design** - Optimal di semua devices
- **Smooth Animations** - Intersection Observer & CSS transitions

### 🔍 Smart Search
- **Material Search** - Pencarian real-time untuk materi ajar
- **Community Search** - Filter proyek berdasarkan judul, deskripsi, atau penulis
- **Tag Filtering** - Sistem tag dinamis untuk community projects
- **Debounced Input** - Performa optimal dengan 300ms debounce

### ♿ Accessibility (A11y)
- **WCAG AA Compliant** - Kontras warna & semantic HTML
- **Keyboard Navigation** - Full keyboard accessibility
- **Screen Reader Support** - ARIA labels & live regions
- **Focus Indicators** - Clear visual feedback untuk keyboard users

### 🚀 Performance
- **PWA Ready** - Progressive Web App dengan offline support
- **Service Worker** - Smart caching strategies
- **Lazy Loading** - Dynamic content loading
- **Optimized Assets** - Minified CSS/JS untuk production

### 📱 PWA Features
- **Installable** - Add to home screen
- **Offline Mode** - Service Worker caching
- **Fast Loading** - Pre-cached static assets
- **App-like Experience** - Full-screen mode

---

## 🚀 Quick Start

### Prerequisites
- Web browser modern (Chrome, Firefox, Safari, Edge)
- Git (untuk clone repository)
- Text editor (VS Code recommended)

### Installation

```bash
# Clone repository
git clone https://github.com/Andhika-Rey/zen.git

# Navigate to project
cd zen

# Open dengan Live Server atau Python
# Option 1: VS Code Live Server extension
# Option 2: Python
python -m http.server 3000

# Open browser
# http://localhost:3000
```

### Development

```bash
# Buat branch baru
git checkout -b feature/your-feature

# Make changes
# ...

# Commit changes
git add .
git commit -m "Add your feature"

# Push
git push origin feature/your-feature
```

---

## 📁 Project Structure

```
zen/
├── index.html              # Homepage
├── community.html          # Community page
├── styles.css             # Global styles
├── script.js              # JavaScript logic
├── sw.js                  # Service Worker
├── manifest.json          # PWA manifest
│
├── materials/             # Material pages
│   ├── program-dasar.html
│   ├── asd.html
│   ├── basis-data.html
│   └── web.html
│
├── data/                  # Dynamic content (JSON)
│   ├── announcements.json
│   └── community.json
│
├── docs/                  # Documentation
│   ├── roadmap.md
│   ├── PERFORMANCE.md
│   └── DEPLOYMENT.md
│
└── .github/
    └── workflows/         # CI/CD pipelines
        └── pages.yml
```

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Flexbox, Grid
- **Vanilla JavaScript** - ES6+ features
- **Service Worker** - PWA & offline support

### Fonts & Icons
- **Google Fonts** - Manrope, Syne
- **Custom SVG** - Icons & graphics

### Deployment
- **GitHub Pages** - Primary hosting
- **Netlify** - Alternative deployment
- **GitHub Actions** - CI/CD automation

---

## 📊 Performance Metrics

### Lighthouse Scores (Target)
- 🟢 Performance: 95+
- 🟢 Accessibility: 100
- 🟢 Best Practices: 100
- 🟢 SEO: 100
- 🟢 PWA: ✓

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## 🎯 Roadmap

### ✅ Completed (v3.0.0)
- [x] Digital Aurora theme redesign
- [x] Community platform with search & filtering
- [x] Light/Dark mode toggle
- [x] Full accessibility audit & improvements
- [x] Service Worker optimization
- [x] SEO enhancements (sitemap, meta tags)
- [x] Responsive design for all devices

### 🔄 In Progress
- [ ] Image optimization (WebP conversion)
- [ ] Analytics integration
- [ ] Advanced search with lunr.js

### 📋 Planned
- [ ] Real Headless CMS integration (Strapi)
- [ ] User authentication system
- [ ] Discussion forum
- [ ] Learning progress tracking
- [ ] Mobile app (TWA)

See [roadmap.md](docs/roadmap.md) for detailed planning.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers/devices
- Update documentation as needed
- Run accessibility checks

---

## 📖 Documentation

- [Roadmap](docs/roadmap.md) - Project planning & features
- [Performance Guide](docs/PERFORMANCE.md) - Optimization tips
- [Deployment Guide](docs/DEPLOYMENT.md) - How to deploy
- [Changelog](CHANGELOG.md) - Version history
- [Improvements](IMPROVEMENTS.md) - Feature checklist

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea?

- **Bug Report**: [Open an issue](https://github.com/Andhika-Rey/zen/issues/new?template=bug_report.md)
- **Feature Request**: [Open an issue](https://github.com/Andhika-Rey/zen/issues/new?template=feature_request.md)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Design Inspiration**: Modern glassmorphism & aurora effects
- **Community**: UNIKOM Computer Science students
- **Tools**: VS Code, GitHub, Netlify
- **Fonts**: Google Fonts (Manrope, Syne)

---

## 📞 Contact & Support

- **GitHub**: [@Andhika-Rey](https://github.com/Andhika-Rey)
- **Email**: support@zenotika.unikom.ac.id _(opsional, WIP)_
- **Website**: [zenotika.unikom.ac.id](https://zenotika.unikom.ac.id/)

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

[![Star on GitHub](https://img.shields.io/github/stars/Andhika-Rey/zen?style=social)](https://github.com/Andhika-Rey/zen)

---

**Built with ❤️ for education by the Zenotika Team**

---

### Quick Links

- [Live Demo](https://zenotika.unikom.ac.id/) 
- [Documentation](docs/)
- [Changelog](CHANGELOG.md)
- [Issues](https://github.com/Andhika-Rey/zen/issues)
- [Pull Requests](https://github.com/Andhika-Rey/zen/pulls)

---

*Last updated: October 2025*

---

## 🎯 Tujuan Proyek

Zenotika berfungsi sebagai platform digital multifungsi:
- **Pusat Informasi**: Menyediakan pengumuman dan jadwal acara penting secara dinamis.
- **Media Pembelajaran**: Menawarkan akses terstruktur ke materi ajar untuk berbagai mata kuliah.
- **Identitas Digital**: Membangun citra komunitas yang modern, profesional, dan berorientasi pada masa depan.

## ✨ Arsitektur & Fitur Unggulan

Dibangun dengan stack yang ringan dan efisien (Vanilla HTML, CSS, JS), Zenotika 2025 memaksimalkan pengalaman pengguna tanpa mengorbankan performa.

### 🎨 UI/UX "Digital Aurora"
- **Glassmorphism**: Efek tembus pandang seperti kaca pada elemen UI (navbar, kartu) untuk menciptakan kedalaman visual.
- **Aurora Background**: Latar belakang gradien animasi yang halus dan dinamis, memberikan nuansa modern dan menenangkan.
- **Tipografi Profesional**: Kombinasi font **Manrope** (untuk teks) dan **Syne** (untuk judul) yang elegan dan mudah dibaca.
- **Skema Warna Baru**: Palet warna yang terinspirasi dari aurora, dengan aksen cerah untuk interaktivitas.

### 🚀 Interaksi Modern
- **Scroll Progress Bar**: Indikator visual di bagian atas yang menunjukkan progres pembacaan halaman.
- **Active Nav Highlighting**: Tautan navigasi aktif secara otomatis saat menggulir ke bagian terkait.
- **Card Spotlight Effect**: Efek cahaya interaktif yang mengikuti kursor mouse saat berada di atas kartu, memberikan feedback visual yang memuaskan.
- **Animasi Fade-In**: Elemen-elemen halaman muncul secara halus saat digulir, menciptakan pengalaman yang dinamis.

### ⚙️ Fitur Fungsional
- **Konten Dinamis**: Pengumuman dan daftar acara dikelola melalui file JSON (`/data/config.json` & `/data/events.json`), memungkinkan pembaruan tanpa mengubah kode.
- **Desain Responsif**: Tampilan yang dioptimalkan untuk semua perangkat, dari desktop hingga mobile.
- **PWA Ready**: Dapat di-cache untuk akses offline berkat Service Worker.
- **Halaman Materi**: Struktur halaman yang bersih dan terorganisir untuk setiap mata kuliah.

## 🛠️ Panduan Pengembangan Lokal

Untuk menjalankan dan mengembangkan situs ini di komputer Anda:

1.  **Prasyarat**: Anda memerlukan `python` atau `node.js` terinstal untuk menjalankan server lokal sederhana.

2.  **Clone Repositori**:
    ```bash
    git clone https://github.com/Andhika-Rey/zen.git
    cd zen
    ```

3.  **Jalankan Server Lokal**:
    Pilih salah satu dari perintah berikut, tergantung pada apa yang Anda miliki.

    *   **Menggunakan Python**:
        ```bash
        # Jika Anda menggunakan Python 3
        python -m http.server
        ```
        Situs akan tersedia di `http://localhost:8000`.

    *   **Menggunakan Node.js (dengan `serve`)**:
        Jika Anda belum memiliki `serve`, instal terlebih dahulu: `npm install -g serve`.
        ```bash
        serve
        ```
        Situs akan tersedia di alamat yang ditampilkan di terminal (biasanya `http://localhost:3000`).

4.  **Selesai!** Buka browser dan kunjungi alamat tersebut untuk melihat situsnya. Setiap perubahan pada file HTML, CSS, atau JS akan langsung terlihat setelah Anda me-refresh halaman.

## 📂 Struktur Direktori

```
/
├── index.html              # Halaman utama
├── styles.css              # Stylesheet utama (termasuk semua gaya Aurora)
├── script.js               # Logika interaksi dan pemuat konten dinamis
├── README.md               # Anda sedang membaca ini
│
├── data/
│   ├── config.json         # Konfigurasi untuk pengumuman & sumber acara
│   └── events.json         # Daftar acara dalam format JSON
│
├── materials/
│   ├── program-dasar.html  # Halaman materi Pemrograman Dasar
│   ├── asd.html            # Halaman materi Algoritma & Struktur Data
│   ├── basis-data.html     # Halaman materi Basis Data
│   └── web.html            # Halaman materi Pengembangan Web
│
├── assets/                 # (Direkomendasikan) Untuk menyimpan gambar atau ikon
│
├── sw.js                   # Service Worker untuk caching PWA
└── manifest.json           # Manifest untuk PWA
```

## 🚀 Panduan Deployment

Situs ini dirancang untuk deployment yang mudah di platform hosting statis.

### GitHub Pages
1.  Pastikan kode Anda ada di repositori GitHub.
2.  Pergi ke `Settings` > `Pages`.
3.  Di bawah `Build and deployment`, pilih `Source` sebagai `Deploy from a branch`.
4.  Pilih branch `main` dan folder `/ (root)`.
5.  Klik `Save`. Situs Anda akan tersedia di `https://<username>.github.io/<repository-name>/`.

### Netlify
1.  Hubungkan akun GitHub Anda ke Netlify.
2.  Pilih repositori ini.
3.  Netlify akan secara otomatis mendeteksi bahwa ini adalah situs statis. Pengaturan build dapat dibiarkan kosong.
4.  Klik `Deploy site`.

---
*Dibuat dengan cinta untuk pendidikan dan kemajuan teknologi. © 2025 Zenotika.*