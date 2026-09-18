# Inventarisasi Linter & React Hook Errors

Dokumen ini mencatat seluruh temuan error dan warning dari hasil eksekusi audit linter ESLint (`npm run lint:check`) pada project.

---

## Ringkasan Temuan
- **Total Masalah**: 9 error (0 warning)
- **Kategori Masalah**:
  1. `@typescript-eslint/no-unused-vars` (Unused imports/variables)
  2. `react-hooks/set-state-in-effect` (Synchronous setState in useEffect triggering cascading renders)

---

## Rincian Temuan Berdasarkan Berkas

### 1. `resources/js/components/store/StoreHeader.tsx`
- **Baris 10:5**:
  - **Aturan**: `@typescript-eslint/no-unused-vars`
  - **Pesan**: `'Calendar' is defined but never used`
  - **Penyebab**: Simbol `Calendar` diimpor dari package `lucide-react` tetapi tidak digunakan di dalam JSX komponen header toko.

---

### 2. `resources/js/pages/seller/dashboard.tsx`
- **Baris 11:5**:
  - **Aturan**: `@typescript-eslint/no-unused-vars`
  - **Pesan**: `'AlertCircle' is defined but never used`
- **Baris 13:5**:
  - **Aturan**: `@typescript-eslint/no-unused-vars`
  - **Pesan**: `'Clock' is defined but never used`
  - **Penyebab**: Ikon `AlertCircle` dan `Clock` diimpor dari `lucide-react` namun tidak terpakai dalam tampilan dashboard seller.

---

### 3. `resources/js/pages/seller/settings.tsx`
- **Baris 8:14**:
  - **Aturan**: `@typescript-eslint/no-unused-vars`
  - **Pesan**: `'ImageIcon' is defined but never used`
- **Baris 10:5**:
  - **Aturan**: `@typescript-eslint/no-unused-vars`
  - **Pesan**: `'Power' is defined but never used`
  - **Penyebab**: Ikon `ImageIcon` dan `Power` diimpor dari `lucide-react` tetapi tidak digunakan pada form pengaturan toko.

---

### 4. `resources/js/pages/store/create.tsx`
- **Baris 2:36**:
  - **Aturan**: `@typescript-eslint/no-unused-vars`
  - **Pesan**: `'FileText' is defined but never used`
  - **Penyebab**: Ikon `FileText` diimpor dari `lucide-react` tanpa digunakan pada halaman pembuatan toko.

---

### 5. `resources/js/pages/product/show.tsx`
- **Baris 117:17**:
  - **Aturan**: `react-hooks/set-state-in-effect`
  - **Pesan**: `Error: Calling setState synchronously within an effect can trigger cascading renders` (pada pemanggilan `setSelectedOptions(initial)`)
  - **Penyebab**: Pemanggilan `setState` di dalam `useEffect` saat mount menyebabkan *cascading re-render*. State awal seharusnya diinisialisasi melalui fungsi lazy initial state pada `useState(() => getInitialOptions(product))`.

- **Baris 154:13**:
  - **Aturan**: `react-hooks/set-state-in-effect`
  - **Pesan**: `Error: Calling setState synchronously within an effect can trigger cascading renders` (pada pemanggilan `setActiveImage(activeSku.image)`)
  - **Penyebab**: Sinkronisasi foto utama dengan foto SKU dilakukan via `useEffect`. Seharusnya diturunkan secara deklaratif (*derived state*) `activeImage = selectedImage ?? activeSku?.image ?? product.image`.

- **Baris 294:13**:
  - **Aturan**: `react-hooks/set-state-in-effect`
  - **Pesan**: `Error: Calling setState synchronously within an effect can trigger cascading renders` (pada pemanggilan `setQuantity(stock)`)
  - **Penyebab**: Clamping kuantitas dilakukan di dalam `useEffect` saat stok berubah. Seharusnya kuantitas efektif dihitung saat render (`Math.min(quantity, stock)`) atau saat event handler kuantitas dieksekusi.

---

## Rencana Aksi & Hasil Resolusi (Resolution Status)
1. **Pembersihan Unused Imports**:
   - `StoreHeader.tsx`: Menghapus import `Calendar` yang tidak terpakai. (Status: **RESOLVED**)
   - `seller/dashboard.tsx`: Menghapus import `AlertCircle` dan `Clock`. (Status: **RESOLVED**)
   - `seller/settings.tsx`: Menghapus import `ImageIcon` dan `Power`. (Status: **RESOLVED**)
   - `store/create.tsx`: Menghapus import `FileText`. (Status: **RESOLVED**)
2. **Refactoring React Hooks di `product/show.tsx`**:
   - Inisialisasi `selectedOptions` menggunakan initializer function `useState(() => getInitialVariantOptions(product))` dan state update saat transisi produk. (Status: **RESOLVED**)
   - Gunakan derived state untuk foto aktif: `activeImage = selectedThumbnail || activeSku?.image || productImage`. (Status: **RESOLVED**)
   - Gunakan derived state untuk kuantitas efektif: `effectiveQuantity = stock <= 0 ? 0 : Math.min(Math.max(1, quantity), stock)` tanpa effect sinkron. (Status: **RESOLVED**)
   - Merapikan padding line between statements sesuai `@stylistic/padding-line-between-statements`. (Status: **RESOLVED**)

---

## Hasil Verifikasi Kualitas Akhir

- `npm run lint:check` : **0 errors, 0 warnings (100% Passed)**
- `npm run types:check` : **0 errors (100% Passed)**
- `php artisan test --compact` : **118 passed, 573 assertions (100% Passed)**

