# 🛍️ Merch Store Beta - Pre-Order Landing Page

**Status:** MVP Complete ✅  
**Phase:** Validation Stage (Pre-Order)  
**Target:** Validate demand sebelum build full e-commerce  
**Timeline:** Implemented October 1, 2025  

---

## 📦 Produk yang Tersedia

### 1. Jaket Angkatan Zenotika
**Spesifikasi:**
- Material: Premium fleece 320 GSM anti-pilling
- Zipper: YKK premium grade
- Custom: Nama + angkatan (bordir)
- Warna: Hitam, Navy, Maroon
- Size: S, M, L, XL, XXL
- Logo: Emblem Zenotika + Logo UNIKOM

**Harga:** Rp 250.000 - 320.000 (tergantung size)

**Minimum Order:** 50-100 pcs per batch (pre-order system)

---

### 2. Jersey Futsal Angkatan Zenotika
**Spesifikasi:**
- Material: Polyester dry-fit breathable
- Custom: Nama punggung + nomor (sablon)
- Teknologi: Moisture-wicking
- Warna: Custom per angkatan
- Size: S, M, L, XL, XXL

**Harga:** Rp 150.000 - 200.000

**Minimum Order:** Pre-order dengan deadline 2 minggu sebelum produksi

---

## 🎯 Business Model

### Revenue Stream
```
Jaket:
- Harga produksi: ~Rp 200K
- Harga jual: Rp 250-320K
- Margin: Rp 50-120K/pcs (15-20%)
- Target: 200 pcs/tahun
- Revenue: Rp 10 juta/tahun

Jersey:
- Harga produksi: ~Rp 120K
- Harga jual: Rp 150-200K
- Margin: Rp 30-80K/pcs (15-25%)
- Target: 150 pcs/tahun
- Revenue: Rp 4.5 juta/tahun

TOTAL ANNUAL REVENUE: Rp 14.5 juta
```

### Allocation of Profit
- **40%** Event komunitas (workshop, speaker, venue)
- **30%** Operasional platform (hosting, domain, tools)
- **20%** Apresiasi kontributor & developer
- **10%** Reserve fund untuk ekspansi

---

## ⚙️ Tech Implementation

### Frontend (Current - Vanilla JS)
```javascript
// Interest tracking with localStorage
- Button state management
- Counter animation
- Toast notifications
- Analytics event tracking
```

**Files Modified:**
- `index.html` → Added merch section (80 lines)
- `styles.css` → Merch store styling (250 lines)
- `script.js` → Interest tracking logic (140 lines)
- `src/command-palette.js` → Added store to search
- `src/search-engine.js` → Indexed merch content

**Features:**
✅ Product cards with descriptions  
✅ Interest counter (localStorage persistence)  
✅ "Daftar Minat" button toggle  
✅ Animated counter updates  
✅ Toast notifications on registration  
✅ Analytics tracking (GA4 events)  
✅ Command Palette integration  
✅ Search engine indexing  
✅ Responsive design  
✅ Progress indicator & production goal tracking  

---

## 📊 Validation Metrics

### Success Criteria (Pre-Order Stage)
- ✅ **50+ interests** untuk Jaket → Proceed to production
- ✅ **50+ interests** untuk Jersey → Proceed to production
- ✅ **100+ total interests** dalam 2 bulan → Build full payment system

### Current Implementation
- ✅ Interest tracking via localStorage
- ✅ Counter visible untuk social proof
- ⏳ Email collection via contact form
- ⏳ Google Forms integration untuk detailed pre-order

---

## 🚀 Next Steps (Phase 3.2 - Full Store)

### When to Proceed:
**Trigger:** 50+ interests per product OR 100+ total interests

### Full E-Commerce Features:
1. **Payment Gateway Integration**
   - Midtrans Snap (QRIS, Transfer Bank, E-wallet)
   - Order tracking dengan unique ID
   - Email confirmation automation

2. **Admin Dashboard**
   - Order management interface
   - Inventory tracking
   - Status updates (pending, paid, shipped)
   - Export orders ke CSV

3. **User Experience**
   - Shopping cart system
   - Size guide modal
   - Product image gallery (real photos)
   - Custom design preview tool

4. **Backend Requirements**
   - Firebase Firestore untuk orders database
   - Firebase Storage untuk product images
   - Firebase Cloud Functions untuk payment webhook
   - SendGrid untuk transactional emails

**Estimated Timeline:** 4 minggu development  
**Estimated Cost:** $0 (Firebase free tier) → $30-50/month (after scale)

---

## 💡 Key Insights

### Why Pre-Order First?
1. **Validate demand** sebelum invest full e-commerce
2. **Zero upfront inventory cost**
3. **Community-driven sizing** (collect size preferences)
4. **Design refinement** based on feedback

### Why Merch for Zenotika?
1. **Revenue diversification** (tidak hanya donation)
2. **Strengthen community identity** (physical merchandise)
3. **Marketing organic** (walking billboard di kampus)
4. **Student engagement** (tangible connection to platform)

### Competitive Advantage
- ✅ Custom design per angkatan
- ✅ Transparent profit allocation
- ✅ Quality assurance (premium materials)
- ✅ Direct-to-student pricing (no middleman)

---

## 📞 Contact & Support

**Pre-Order Questions:**  
Email: store@zenotika.unikom.ac.id (placeholder)  
Discord: #merch-store channel  

**Supplier Partnership:**  
Looking for quality apparel manufacturers in Bandung with:
- Min order 50-100 pcs
- Custom embroidery & sablon
- 2-3 weeks production lead time
- Warranty for material defects

---

## 📜 Legal & Compliance

### Student Organization Requirements
- ✅ Verify legal status untuk jual merchandise
- ✅ Tax compliance (NPWP jika omzet >Rp 500 juta/tahun)
- ✅ Copyright clearance untuk logo UNIKOM usage
- ✅ Terms & Conditions untuk pre-order cancellation

### Refund Policy (Pre-Order)
- Full refund sebelum production start
- No refund setelah production (non-refundable deposit)
- Size exchange allowed (subject to availability)
- Defect replacement guaranteed

---

## 🎉 Launch Strategy

### Phase 1: Soft Launch (Week 1-2)
- Announce di Discord & WhatsApp groups
- Showcase mockup designs
- Collect early interest (target: 30+)

### Phase 2: Campus Activation (Week 3-4)
- Booth di area kampus (display sample)
- Ambassador program (5-10 students per angkatan)
- Photo campaign (#ZenotikaWear)

### Phase 3: Pre-Order Close (Week 5-6)
- Final reminder & countdown
- Analyze data: most popular size/color
- Confirm production dengan supplier

### Phase 4: Production & Delivery (Week 7-10)
- Production monitoring (2-3 weeks)
- Quality check before distribution
- Pickup event di kampus (build community)

---

**Status Update:** Pre-order landing page live ✅  
**Local Preview:** http://localhost:8000/#store  
**Git Status:** Ready to commit  

Next action: Survey mahasiswa untuk gauge interest + Supplier outreach
