# Roadmap Pengembangan Zenotika - Q4 2025

Rencana proaktif ini berfokus pada peningkatan fungsionalitas, keberlanjutan, dan pengalaman pengguna untuk platform Zenotika.

---

## Status Snapshot (Oktober 2025)

- ✅ Fase 1 hampir rampung: audit aksesibilitas, toggle tema, dan SEO dasar telah diterapkan.
- ✅ Fondasi fitur pencarian & filter komunitas selesai; optimalisasi performa lanjutan sedang berjalan.
- ✅ Lazy loading & responsive image pipeline untuk kartu komunitas aktif (Okt 2025).
- ⏳ Konversi aset statis internal ke WebP dan proses minifikasi otomatis masih dalam eksperimen.
- ⏳ Integrasi analytics & error tracking berada di pipeline sprint berikutnya.
- 🚀 Fokus kuartal depan: persiapan integrasi Headless CMS & pencarian lanjutan berbasis indeks.

### **Fase 1: Peningkatan Kualitas & Pengalaman Pengguna (Jangka Pendek - 1-2 Minggu)**

Fondasi untuk memastikan apa yang sudah dibangun mencapai standar keunggulan.

1.  **Audit dan Peningkatan Aksesibilitas (A11y):**
    *   **Status:** ✅ Iterasi berkelanjutan — preferensi gerak kini memengaruhi animasi dinamis (fade-in & spotlight), kontras tinggi, dan outline yang konsisten (Okt 2025).
    *   **Masalah:** Situs yang profesional harus dapat diakses oleh semua orang, termasuk mereka yang menggunakan pembaca layar atau navigasi keyboard.
    *   **Tindakan:** Melakukan audit untuk memastikan semua elemen interaktif dapat diakses keyboard, kontras warna memenuhi standar WCAG, dan atribut ARIA digunakan dengan benar. Berikutnya: audit screen reader end-to-end + pengujian NVDA/VoiceOver.

2.  **Optimasi Performa Lanjutan:**
    *   **Status:** ✅ Fase 1 selesai — lazy loading + responsive `srcset` aktif; script optimasi WebP + dokumentasi lengkap tersedia (Okt 2025). ⏳ Berikutnya: minifikasi CSS/JS otomatis + CI/CD pipeline.
    *   **Masalah:** Kecepatan adalah kunci. Situs bisa dibuat lebih cepat lagi.
    *   **Tindakan:** Mengoptimalkan semua aset gambar ke format modern (seperti WebP), melakukan *minification* pada file CSS dan JS untuk produksi, dan meninjau strategi *caching* Service Worker agar lebih efisien. ✅ Pipeline WebP tersedia via `npm run optimize:images`. Aksi berikut: tambahkan build tool ringan (mis. `esbuild`/`lightningcss`) untuk minifikasi otomatis.

3.  **Peningkatan SEO (Search Engine Optimization):**
    *   **Status:** ✅ Meta OG/Twitter, `sitemap.xml`, `robots.txt`, dan schema.org (Organization, Courses, ItemList) sudah tayang; berikutnya tinggal validasi Search Console + breadcrumbs.
    *   **Masalah:** Agar Zenotika mudah ditemukan dan dibagikan secara profesional di media sosial.
    *   **Tindakan:** Menambahkan meta tag Open Graph (untuk pratinjau di WhatsApp, Twitter, dll.), membuat file `sitemap.xml` untuk membantu Google mengindeks semua halaman, dan membuat `robots.txt`. Selanjutnya: jalankan uji Rich Results & koneksikan ke Google Search Console.

---

### **Fase 2: Fungsionalitas Inti & Keterlibatan Pengguna (Jangka Menengah - 1 Bulan)**

Langkah untuk membuat platform lebih berguna dan interaktif.

1.  **Implementasi Fitur Pencarian (Search):**
    *   **Status:** ✅ Tahap 1 selesai — pencarian dasar + filter komunitas berjalan. Berikutnya: indeks materi global & highlight hasil.
    *   **Masalah:** Seiring bertambahnya materi ajar, pengguna akan kesulitan menemukan informasi spesifik.
    *   **Tindakan:** Mengintegrasikan pustaka pencarian sisi klien (seperti `lunr.js`) untuk memungkinkan pengguna mencari konten materi secara instan.

2.  **Mode Terang/Gelap (Light/Dark Mode Toggle):**
    *   **Status:** ✅ Implementasi live dengan persistensi `localStorage`, sinkron preferensi OS, dan styling lengkap (Sep–Okt 2025).
    *   **Masalah:** Preferensi visual pengguna bervariasi. Memberikan pilihan adalah standar UX modern.
    *   **Tindakan:** Mengimplementasikan *toggle* yang memungkinkan pengguna beralih antara mode gelap dan terang, dengan preferensi mereka disimpan di `localStorage`. Iterasi berikut: tambahkan animasi transisi tema yang ramah mata & opsi kontras tinggi.

---

### **Fase 3: Keberlanjutan & Pengelolaan Konten (Visi Jangka Panjang - 2-3 Bulan)**

Langkah paling strategis untuk masa depan Zenotika.

1.  **Integrasi dengan Headless CMS (Content Management System):**
    *   **Masalah:** Saat ini, pembaruan konten memerlukan intervensi developer. Ini tidak berkelanjutan untuk pengurus non-teknis.
    *   **Tindakan:** Memigrasikan pengelolaan konten (pengumuman, acara, daftar modul) ke Headless CMS gratis seperti **Strapi**, **Payload CMS**, atau **Decap CMS**.
    *   **Keuntungan:**
        *   Pengurus mendapatkan antarmuka web yang ramah pengguna untuk mengelola konten.
        *   Perubahan dapat langsung tayang tanpa perlu deployment ulang.
        *   Situs tetap secepat situs statis.
        *   Ini adalah langkah krusial untuk membuat Zenotika menjadi proyek komunitas yang hidup dan mandiri.
