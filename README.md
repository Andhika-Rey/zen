# ✨ Zenotika — Digital Aurora 2025

_Platform digital modern untuk komunitas Ilmu Komputer UNIKOM. Kurasi materi belajar, kolaborasi komunitas, dan pengalaman PWA kelas profesional._

<p align="center">
  <a href="https://github.com/Andhika-Rey/zen"><img alt="Version" src="https://img.shields.io/badge/version-3.1.0-1d4ed8.svg" /></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-16a34a.svg" /></a>
  <a href="docs/project-reports/PHASE_2_FINAL_REPORT.md"><img alt="Phase 2" src="https://img.shields.io/badge/Phase_2-100%25-success.svg" /></a>
</p>

<p align="center">
  <a href="#status">Status</a> ·
  <a href="#fitur-utama">Fitur</a> ·
  <a href="#mulai-cepat">Mulai Cepat</a> ·
  <a href="#struktur">Struktur</a> ·
  <a href="#dokumentasi">Dokumentasi</a>
</p>

---

## <a name="status"></a>🎯 Status Proyek

| Area | Kondisi |
| --- | --- |
| Phase 2 | ✅ Selesai (4/4 fitur) |
| Lighthouse | 🎯 395 / 400 (98.75%) |
| Accessibility | ♿ 100 / 100 (WCAG AA) |
| Bundle | 📦 154KB (94KB initial + 60KB lazy) |
| Deployment | 🚀 Siap rilis |

---

## <a name="ringkasan"></a>📌 Ringkasan

- ✨ **Aurora Design System** dengan glassmorphism, tipografi Syne/Manrope, dan dark/light mode.
- ⚡ **Performa tinggi**: debounced search, skeleton loading, dan Service Worker adaptif.
- ♿ **Aksesibilitas penuh**: 100/100 Lighthouse, ARIA live regions, focus management.
- 🔍 **11 fitur utama** termasuk Command Palette, Advanced Search, Toast Notifications, dan Consent Manager.
- 🔒 **Privacy-first analytics** (GA4) dengan banner persetujuan sesuai GDPR/CCPA.
- 🧭 **Experience Layer 2025** memadukan adaptive learning engine, analytics consent-aware, dan collaboration suite profesional.
- 📈 **Insights & Roadmap** menghadirkan testimoni komunitas, timeline rilis, serta CTA modern untuk kolaborasi lintas kampus.

> 🎓 Dokumentasi utama menggunakan Bahasa Indonesia dengan istilah teknis populer agar tetap familiar bagi developer UNIKOM.

---

## <a name="fitur-utama"></a>🌈 Fitur Utama

### Phase 1 — Fondasi UX (✅ 7 fitur)
- **Keyboard & navigasi:** Fokus cepat (`/`), modal bantuan (`?`), Esc untuk keluar.
- **Form pintar:** Validasi inline dengan domain kampus `@mahasiswa.unikom.ac.id` dan feedback real-time.
- **Performa & PWA:** Skeleton loading, Service Worker (`sw.js`), manifest siap install.
- **Aksesibilitas:** NoScript banner, status `aria-live`, dan warna kontras tinggi.

### Phase 2 — Fitur Lanjutan (✅ 4 fitur)
- **Command Palette (⌨️ Ctrl/Cmd + Shift + K):** Fuse.js, histori halaman, quick actions.
- **Toast Notifications:** 4 varian (success/error/warning/info), auto-dismiss, action button.
- **Advanced Search (Ctrl/Cmd + Shift + F):** Lunr.js, filter kategori, histori kueri, hasil <50ms.
- **Analytics & Consent:** GA4 modular, consent banner opt-in, Core Web Vitals tracking.

### Experience Layer — Profesional 2025 (🎉 Baru)
- **Adaptive Learning Engine:** grid experience baru dengan rekomendasi jalur belajar dan insight personal.
- **Privacy-first Analytics:** badge performa realtime dengan pengukuran durasi muat berbasis Navigation Timing API.
- **Pro Collaboration Suite:** CTA command palette, quick actions, dan integrasi GitHub/Discord yang responsif.
- **Quick Access Launcher:** Floating action button untuk membuka Command Palette, Advanced Search, atau kembali ke atas hanya dengan satu klik.

---

## <a name="pintasan"></a>⌨️ Pintasan Keyboard

| Pintasan | Aksi |
| --- | --- |
| `/` | Fokus kolom pencarian materi |
| `Ctrl/Cmd + Shift + F` | Buka Advanced Search |
| `Ctrl/Cmd + Shift + K` | Buka Command Palette |
| `Ctrl/Cmd + Shift + X` | Toggle mode terang/gelap |
| `?` | Buka modal bantuan pintasan |
| `Esc` | Tutup modal aktif |

> Kombinasi baru menggunakan `Shift` untuk menghindari konflik dengan pintasan bawaan Chrome.

---

## <a name="mulai-cepat"></a>⚡ Mulai Cepat

```bash
# 1. Clone repo
git clone https://github.com/Andhika-Rey/zen.git
cd zen

# 2. Install dependencies
npm install

# 3. Jalankan lingkungan pengembangan
npm run dev

# 4. Buka di browser (Linux)
xdg-open http://localhost:3000
```

### Build Production

```bash
npm run build
cd dist
python -m http.server 8080
```

---

## <a name="struktur"></a>🗂️ Struktur Proyek

```
zen/
├── index.html, script.js, styles.css   # File utama
├── src/                                # Modul fitur (command palette, search, toast, analytics)
├── data/                               # JSON pengumuman & komunitas
├── scripts/                            # Build pipeline & utilitas
├── docs/                               # Dokumentasi terstruktur
├── materials/                          # Materi pembelajaran
├── assets/                             # Aset statis (ikon, gambar)
└── dist/                               # Output build production
```

🔍 Detail lengkap tersedia di [`STRUCTURE.md`](STRUCTURE.md).

---

## <a name="dokumentasi"></a>📚 Dokumentasi Penting

| Untuk | Dokumen |
| --- | --- |
| Developer baru | [QUICK_START.md](QUICK_START.md) |
| Ringkasan fitur | [SHOWCASE_2025.md](SHOWCASE_2025.md) |
| Laporan fase | [docs/project-reports/](docs/project-reports/) |
| Panduan dev | [docs/guides/](docs/guides/) |
| Deployment | [docs/deployment/DEPLOYMENT.md](docs/deployment/DEPLOYMENT.md) |
| Struktur repo | [STRUCTURE.md](STRUCTURE.md) |

Semua dokumentasi dipetakan di [docs/README.md](docs/README.md).

---

## <a name="deploy"></a>🚀 Deployment

- **GitHub Pages:** Build statis siap di `dist/`. Ikuti [DEPLOYMENT.md](docs/deployment/DEPLOYMENT.md#github-pages).
- **Netlify / Vercel:** Deploy langsung folder `dist/` (0 config, <1 menit).
- **Custom hosting:** Salin isi `dist/` ke server atau bucket S3.

Checklist build otomatis tersedia di `dist/DEPLOY_CHECKLIST.md` setiap kali `npm run build` dijalankan.

---

## <a name="kinerja"></a>📊 Kinerja & Kualitas

- **Lighthouse:** 98.75/100 keseluruhan (Performance 95, Accessibility 100, Best Practices 100, SEO 100).
- **Core Web Vitals:** LCP < 1.5s, FID < 50ms, CLS < 0.1.
- **Build Pipeline:** esbuild + clean-css, selesai < 5 detik, bundle 154KB.
- **Testing Manual:** Checklist QA di [docs/guides/TESTING_CHECKLIST.md](docs/guides/TESTING_CHECKLIST.md).

---

## <a name="kontribusi"></a>🤝 Kontribusi

1. Fork & clone repo.
2. Buat branch: `git checkout -b feature/awesome-enhancement`.
3. Commit perubahan: `git commit -m "feat: awesome enhancement"`.
4. Push & buka Pull Request.

Tips: sertakan update dokumentasi & jalankan `npm run build` sebelum mengirim PR.

---

## <a name="kontak"></a>📞 Support & Kontak

- Email: [support@zenotika.unikom.ac.id](mailto:support@zenotika.unikom.ac.id)
- Komunitas: [Discord Zenotika](https://discord.gg/zenotika)
- Issue tracker: [GitHub Issues](https://github.com/Andhika-Rey/zen/issues)

---

## <a name="lisensi"></a>📜 Lisensi

Proyek ini dirilis di bawah lisensi MIT. Lihat file [LICENSE](LICENSE) untuk detail lengkapnya.

<p align="center">Made with ❤️ for Mahasiswa Informatika UNIKOM</p>
