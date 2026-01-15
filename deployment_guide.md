# Panduan Deployment ke Vercel

Agar pembayaran Sandbox berfungsi di Server Online (Vercel), ikuti langkah ini dengan **TELITI**.

## 1. Update Environment Variable di Vercel (PENTING!)
Sebelum deploy, ubah pengaturan server Vercel Anda:

1.  Buka [Vercel Dashboard](https://vercel.com).
2.  Pilih Project: `salahuddin-library`.
3.  Klik tab **Settings** -> menu **Environment Variables**.
4.  Cari `MIDTRANS_IS_PRODUCTION` dan ubah nilainya menjadi **`false`** (kecil semua).
5.  Pastikan `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY` sudah benar (Kunci yang Anda pakai).

## 2. Upload Kode Baru (Deploy)
Jalan perintah berikut di terminal VSCode Anda untuk meng-upload perbaikan yang saya buat:

```bash
git add .
git commit -m "fix: force midtrans sandbox mode for vercel"
git push origin main
```
*(Sesuaikan `main` dengan nama branch Anda, misalnya `master` jika ada error)*

## 3. Tunggu Proses Build
1.  Buka tab **Deployments** di Vercel Dashboard.
2.  Anda akan melihat deployment baru sedang berjalan (warna kuning/biru).
3.  Tunggu sampai statusnya **Ready** (warna hijau).

## 4. Test
Buka website online Anda (`https://salahuddin-library.vercel.app`), lalu coba lakukan pembayaran. Seharusnya sekarang sudah berhasil masuk ke mode Sandbox.
