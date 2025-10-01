# 🗺️ Zenotika Roadmap 2025-2026 (Fase 3-4)
## Untuk Komunitas 450-1000 Mahasiswa Informatika UNIKOM

**Current Version:** 3.1.0 (Phase 2 Complete)  
**Target Audience:** 450-1000 mahasiswa aktif  
**Focus:** Community Learning Hub + Merch Store

---

## 🎯 Visi Strategis

**Zenotika BUKAN pengganti SIAKAD/LMS kampus**, melainkan:
- 🏠 **Community Hub** untuk kolaborasi mahasiswa
- 📚 **Curated Learning Resources** dengan mentor guidance
- 🛍️ **Merch Store** untuk identitas angkatan
- 💼 **Portfolio Showcase** untuk persiapan karier

---

## Phase 3: Community & Commerce (Q4 2025)

### 3.1 Discussion Forum (Priority: HIGH)

**Fitur:**
- Thread-based discussion dengan tagging (Pemrograman, Data, Web, Karier, etc.)
- Upvote/downvote untuk kualitas konten
- Markdown support untuk code snippet sharing
- Search & filter by tags, dates, most helpful
- Notification untuk reply & mention

**Tech Stack:**
- Frontend: Vanilla JS dengan lazy loading
- Storage: Firebase Firestore (free tier: 1GB storage, 50K reads/day)
- Auth: Firebase Auth via email kampus @mahasiswa.unikom.ac.id
- Moderation: Admin panel untuk flag/remove inappropriate content

**Capacity:**
- 1000 users × 10 posts/month = 10K posts/month
- Firebase free tier cukup untuk 12-18 bulan pertama
- Upgrade ke Blaze plan (~$25/month) setelah 1.5K+ active users

**Timeline:** 3 minggu
- Week 1: Auth system + basic thread CRUD
- Week 2: Voting, comments, tags, search
- Week 3: Moderation panel, notifications, polish

---

### 3.2 Merch Store (Priority: HIGH)

**Katalog Awal (2 Produk):**
1. **Jaket Angkatan Zenotika**
   - Variant: Hitam, Navy, Maroon (S-XXL)
   - Harga: Rp 250.000 - 320.000
   - Pre-order system (batch 50-100 pcs per angkatan)

2. **Jersey Futsal Angkatan Zenotika**
   - Custom nama & nomor punggung
   - Harga: Rp 150.000 - 200.000
   - Pre-order dengan deadline 2 minggu sebelum produksi

**Fitur Store:**
- Product catalog dengan variant selector (size, color)
- Shopping cart & checkout flow
- Payment integration: Midtrans (QRIS, Transfer Bank, E-wallet)
- Order tracking & status updates
- Admin dashboard untuk manage orders

**Tech Stack:**
- Payment Gateway: **Midtrans Snap** (free tier: 0% fee untuk QRIS/Transfer)
  - Alternatif: Xendit, Doku
- Database: Firebase Firestore untuk orders & inventory
- Image CDN: Cloudinary free tier (25 GB storage)
- Email: SendGrid free tier (100 emails/day) untuk konfirmasi order

**Business Model:**
- Markup 15-20% dari harga produksi untuk operasional
- Revenue estimate: 200 jaket × Rp 50K margin = Rp 10 juta
- 150 jersey × Rp 30K margin = Rp 4.5 juta
- Total: Rp 14.5 juta/tahun untuk funding event & operasional

**Timeline:** 4 minggu
- Week 1: Product catalog UI + variant selector
- Week 2: Cart & checkout flow + Midtrans integration
- Week 3: Order management dashboard
- Week 4: Testing, email automation, launch prep

---

### 3.3 Student Portfolio Showcase (Priority: MEDIUM)

**Fitur:**
- Profile page untuk setiap mahasiswa (public URL)
- Upload project showcase (GitHub link, live demo, screenshot)
- Skill tags & tech stack labels
- Featured projects di homepage Zenotika
- Export portfolio ke PDF untuk job application

**Tech Stack:**
- Storage: Firebase Storage (5GB free) untuk screenshots
- Database: Firestore untuk profile & projects data
- PDF Export: jsPDF library (client-side generation)

**Value Proposition:**
- Portfolio gratis untuk mahasiswa (tidak perlu bikin website sendiri)
- Recruiter bisa browse talent pool UNIKOM
- Gamifikasi: badge untuk "Featured Project", "Most Viewed"

**Timeline:** 2 minggu
- Week 1: Profile CRUD + project upload
- Week 2: Featured showcase, PDF export, polish

---

## Phase 4: Intelligence & Scale (Q1-Q2 2026)

### 4.1 Mentor Matching System (Priority: MEDIUM)

**Fitur:**
- Senior mahasiswa (angkatan 2020-2022) register sebagai mentor
- Junior browse mentor by expertise (Web, Mobile, Data, etc.)
- Booking slot untuk 1-on-1 mentoring (Google Meet integration)
- Rating & review system
- Mentor leaderboard (top contributors)

**Incentive untuk Mentor:**
- Certificate of Mentorship dari Zenotika
- Priority access untuk event eksklusif
- Poin untuk redeem merch discount

**Timeline:** 3 minggu

---

### 4.2 Event Management Pro (Priority: MEDIUM)

**Upgrade dari fitur existing:**
- Ticketing system untuk workshop berbayar (Rp 10K-50K)
- Attendance tracking via QR code check-in
- Certificate generator untuk peserta
- Recording archive untuk event video
- Waitlist & cancellation management

**Revenue Model:**
- Workshop fee: Rp 25K × 50 peserta = Rp 1.25 juta/event
- 10 workshop/tahun = Rp 12.5 juta untuk speaker honorarium & operasional

**Timeline:** 2 minggu

---

### 4.3 Learning Path Recommendation (Priority: LOW)

**Fitur:**
- AI-powered recommendation berdasarkan progress belajar
- Personalized learning roadmap (e.g., "Frontend Developer Track")
- Prerequisite checker (sudah belajar X sebelum Y)
- Progress tracking & achievement system

**Tech Stack:**
- ML Model: TensorFlow.js (client-side inference)
- Training data: user interaction history (clicks, time spent, completion)

**Timeline:** 4 minggu (research intensive)

---

## 📊 Capacity Planning

### Infrastructure (Firebase Free → Paid)

**Free Tier Limits:**
- Firestore: 1GB storage, 50K reads/day, 20K writes/day
- Auth: Unlimited users
- Storage: 5GB, 1GB/day download
- Hosting: 10GB/month bandwidth

**Growth Projection:**
- Month 1-6: 300-500 active users → Stay on free tier
- Month 7-12: 600-800 active users → Monitor limits
- Month 13+: 900-1200 active users → Upgrade to Blaze (~$30-50/month)

### Cost Estimate (Monthly, After Scale)

| Service | Free Tier | Paid (1000 users) |
|---------|-----------|-------------------|
| Firebase | $0 | $30-40 |
| Midtrans | $0 (QRIS) | $0 (fee per txn) |
| Cloudinary | $0 | $0 (within limits) |
| SendGrid | $0 | $15 (400 emails/day) |
| Domain + SSL | $0 (GitHub Pages) | $0 |
| **TOTAL** | **$0** | **$45-55/month** |

**Funding Strategy:**
- Merch profit: Rp 14.5 juta/tahun = Rp 1.2 juta/bulan (~$80/month)
- Workshop revenue: Rp 12.5 juta/tahun = Rp 1 juta/bulan (~$70/month)
- **Total sustainable:** $150/month → Cukup untuk cover infra + reinvestasi

---

## 🛠️ Tech Stack Evolution

### Phase 3 (Q4 2025)
```
Frontend: Vanilla JS + Web Components
Backend: Firebase (Firestore + Auth + Functions)
Payment: Midtrans Snap
Storage: Firebase Storage + Cloudinary
Email: SendGrid
Analytics: GA4 + Custom events
```

### Phase 4 (Q1-Q2 2026)
```
+ API Gateway: Firebase Cloud Functions (serverless)
+ ML: TensorFlow.js for recommendations
+ Real-time: Firebase Realtime Database for live updates
+ CDN: Cloudflare for global distribution
```

---

## 🚀 Quick Wins (Immediate Next Steps)

### 1. Merch Landing Page ✅ COMPLETED (Oct 1, 2025)
- ✅ Created `/store` section di website
- ✅ Static catalog dengan "Pre-order" CTA + interest tracking
- ✅ Interest counter dengan localStorage persistence
- ✅ Integrated dengan Command Palette & Search
- ⏳ Next: Collect detailed pre-order via Google Forms
- ⏳ Next: Validate demand (target: 50+ interests per product)

### 2. Forum Beta (2 Weeks MVP)
- Simple thread system tanpa voting
- Firebase Auth + Firestore CRUD
- Soft launch untuk 50 early adopters
- Collect feedback untuk prioritize features

### 3. Portfolio Profiles (1 Week MVP)
- Basic profile page with projects list
- GitHub link + short bio
- Featured di Community page
- Iterate based on usage

---

## 📈 Success Metrics

### Phase 3 Targets (6 Months)
- 500+ active users/month
- 100+ forum threads
- 50+ merch orders
- 30+ portfolio profiles

### Phase 4 Targets (12 Months)
- 800+ active users/month
- 300+ forum threads
- 200+ merch orders
- 100+ mentoring sessions
- 5+ paid workshops

---

## 🎓 Why This Scope Makes Sense

### ✅ Realistic for 450-1000 Students
- Tidak overlap dengan sistem kampus (SIAKAD, LMS)
- Fokus pada value add: komunitas + resources
- Scalable dengan budget terbatas
- Sustainable revenue model

### ✅ Community-Driven
- Forum menjadi tempat diskusi asinkron
- Merch memperkuat identitas & belonging
- Portfolio membantu persiapan karier
- Mentor matching leverage senior knowledge

### ✅ Monetization Path
- Merch margin funds operational cost
- Workshop revenue pays for speakers
- Surplus reinvested untuk expansion
- No dependency on external funding

---

## 🔮 Long-Term Vision (2027+)

- **Zenotika Network:** Expand ke kampus lain di Indonesia
- **Job Board:** Partnership dengan startup untuk internship posting
- **Certificate Program:** Skill badges recognized by industry
- **Alumni Network:** Connect graduates dengan current students

---

## 📞 Next Action Items

1. **Validate Demand:**
   - Survey mahasiswa untuk prioritas fitur (Forum vs Merch vs Portfolio)
   - Pre-launch interest form untuk jaket & jersey

2. **Technical Foundation:**
   - Setup Firebase project
   - Configure Midtrans sandbox account
   - Design database schema untuk Forum + Store

3. **Team Formation:**
   - Frontend: 1-2 developers
   - Backend/Firebase: 1 developer
   - Designer: 1 UI/UX designer
   - Content: 1-2 curators untuk moderasi forum

4. **Timeline:**
   - Month 1: MVP Forum + Merch landing
   - Month 2: Full store + Payment integration
   - Month 3: Portfolio + Polish + Launch

---

**Dokumen ini adalah panduan strategis, bukan spesifikasi teknis final. Prioritas bisa disesuaikan based on feedback komunitas.**

