# Zenotika 2025 - Digital Aurora

🏠 **Zenotika adalah sebuah rumah digital modern** yang dirancang sebagai pusat informasi, pembelajaran, dan komunitas untuk 450+ mahasiswa Ilmu Komputer di Universitas Komputer Indonesia (UNIKOM).

*Versi ini merupakan transformasi total dari desain sebelumnya, mengusung tema "Digital Aurora" untuk pengalaman pengguna yang profesional, modern, dan imersif di tahun 2025.*

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