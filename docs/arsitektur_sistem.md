# 🏛️ Cara Kerja & Arsitektur Sistem - Salahuddin Library (Penjelasan Sangat Sederhana)
> Dokumen ini menjelaskan cara kerja aplikasi **Salahuddin Library** dengan bahasa sehari-hari yang sangat mudah dipahami oleh orang awam (bebas dari istilah komputer yang membingungkan!). Cocok sekali untuk bahan presentasi, laporan sidang, atau menjelaskan kepada siapa pun yang ingin tahu konsep praktisnya saja dalam waktu 5 menit.

---

## 🌟 1. Apa itu Salahuddin Library & Untuk Siapa?

Salahuddin Library adalah aplikasi perpustakaan digital. Aplikasi ini mempermudah dua kelompok orang:
1. **Anggota Perpustakaan (Masyarakat / Mahasiswa):** Bisa melihat daftar buku lewat HP atau laptop, mengecek apakah buku masih tersedia di rak perpustakaan atau sedang dipinjam orang lain, mengunggah foto KTP untuk menjadi anggota resmi, serta membayar pendaftaran dan denda lewat bantuan WhatsApp.
2. **Petugas Perpustakaan (Admin):** Memiliki halaman kontrol khusus untuk menambah buku baru ke katalog, memeriksa dan menyetujui pendaftaran KTP anggota baru, mencatat peminjaman buku, serta mengembalikan buku ke dalam stok rak secara digital.

---

## 🏗️ 2. Arsitektur Aplikasi: 5 Komponen Utama yang Bekerja Sama

Bayangkan sistem aplikasi ini seperti **kantor perpustakaan fisik modern** yang memiliki beberapa staf dengan tugasnya masing-masing:

### Penjelasan Bagian Utama (Menggunakan Analogi):

1. **Pintu Depan Aplikasi (Tampilan HP & Web):**
   * Ini adalah halaman aplikasi yang dibuka oleh anggota dan admin di layar HP atau laptop mereka. Di sini mereka bisa mengklik tombol, mencari judul buku, dan melihat halaman profil mereka.
   * *Fitur Pintar:* Aplikasi ini otomatis mendeteksi jika foto KTP yang diunggah pengguna terlalu besar, lalu otomatis mengecilkannya di dalam HP sebelum dikirim agar hemat kuota internet pengguna dan prosesnya cepat.

2. **Buku Catatan Digital & Kunci Keamanan (Google Firebase):**
   * **Buku Catatan Digital:** Ini seperti papan pengumuman ajaib. Semua data buku, stok di rak, riwayat pinjam, dan profil anggota dicatat di sini. Uniknya, papan ini bersifat **realtime**. Artinya, jika ada anggota meminjam buku "A" di perpustakaan, stok buku tersebut langsung berkurang saat itu juga di HP seluruh pengguna lain tanpa perlu memuat ulang (*refresh*) halaman web.
   * **Kunci Keamanan:** Bertugas mengamankan pendaftaran akun dan menjaga kata sandi (*password*) pengguna agar tidak bisa diintip atau dibajak orang lain.

3. **Gudang Foto Pintar (Cloudinary):**
   * Ini adalah laci penyimpanan khusus untuk menyimpan foto KTP anggota yang mendaftar dan gambar sampul buku.
   * Gudang ini pintar; ia otomatis mengecilkan ukuran memori gambar secara otomatis tanpa merusak kejelasan gambarnya, sehingga katalog buku perpustakaan sangat ringan saat dibuka.

4. **Tukang Pos Otomatis (Server Email):**
   * Ini adalah robot asisten yang bertugas di belakang layar.
   * Tugasnya sangat sederhana: begitu Petugas Perpustakaan menyetujui pendaftaran KTP anggota baru, asisten ini otomatis menulis dan mengirimkan surat selamat melalui email perpustakaan langsung ke alamat email anggota tersebut.

5. **Penghubung WhatsApp (WhatsApp Link):**
   * Tombol khusus yang jika diklik langsung mengarahkan anggota masuk ke ruang chat WhatsApp bersama Admin perpustakaan. Sangat praktis untuk mengurus pembayaran pendaftaran Rp 50.000 sekali seumur hidup atau membayar denda keterlambatan buku.

---

## 🔄 3. Alur Kerja Aplikasi (Bagaimana Prosesnya Berjalan?)

### A. Alur Pendaftaran Anggota Baru & Penerimaan Email Selamat
Proses dari saat pengguna mendaftar, mengunggah foto KTP, diverifikasi oleh petugas, hingga menerima email notifikasi resmi:

1. **Anggota** membuka halaman profil di HP-nya, lalu memotret KTP-nya dan menekan tombol unggah.
2. **Aplikasi** secara cerdas mengecilkan ukuran gambar KTP tersebut agar kuota internet pengguna tetap hemat.
3. Gambar KTP disimpan di **Gudang Foto Pintar**, dan link fotonya dicatat di **Buku Catatan Digital**. Status anggota menjadi **"Menunggu Persetujuan"**.
4. **Petugas Perpustakaan** membuka komputernya, melihat foto KTP anggota tersebut, lalu mengklik tombol **"Setujui KTP"**.
5. Status anggota di **Buku Catatan Digital** otomatis berubah menjadi **"Terverifikasi"** (Anggota Resmi).
6. Sistem memberi tahu **Tukang Pos Otomatis** untuk segera bertindak.
7. **Tukang Pos Otomatis** mengirim surat ucapan selamat resmi ke email Anggota.
8. **Anggota** menerima email notifikasi selamat tersebut di kotak masuk email HP-nya.

### 🔴 *Bagaimana jika KTP Ditolak? (Alur Penolakan Cerdas)*
Jika KTP yang diunggah kurang jelas atau tidak valid, Petugas Perpustakaan dapat menolak pendaftaran dengan memberikan alasan penolakan tertulis:
1. **Petugas** menekan tombol **"Tolak"** dan mengetikkan alasan penolakan (misalnya: *"Foto KTP buram, silakan foto ulang di tempat yang terang"*).
2. Sistem otomatis menghapus file foto KTP lama dari **Gudang Foto Pintar** agar tidak memakan ruang penyimpanan gratis.
3. Di **Buku Catatan Digital**, status keanggotaan diubah menjadi **"Pendaftaran Ditolak"** dan menyimpan teks alasan penolakan tersebut.
4. Di HP **Anggota**, status keanggotaan berubah menjadi warna merah bertuliskan **"Pendaftaran Ditolak"**.
5. Tepat di bawah area unggah KTP pada HP Anggota, akan muncul **Kotak Pesan Merah** yang menampilkan pesan alasan penolakan persis seperti yang ditulis oleh Petugas.
6. **Anggota** dapat langsung memotret ulang KTP-nya dan menekan tombol unggah kembali. Begitu diunggah ulang, Kotak Pesan Merah otomatis menghilang dan status keanggotaan berganti kembali menjadi **"Menunggu Persetujuan"** agar bisa diperiksa ulang oleh Petugas.

---

### B. Alur Peminjaman Buku & Pengurangan Stok Otomatis
Proses bagaimana buku dipinjam, stok berkurang, denda dihitung, dan buku dikembalikan:

1. **Anggota** mencari buku di katalog lewat HP, menemukan buku yang dicari, lalu menekan tombol **"Pinjam Buku"**.
2. **Buku Catatan Digital** mencatat bahwa buku tersebut sedang dipinjam (pengguna diberi waktu maksimal 5 hari untuk membaca).
3. Stok buku di database otomatis berkurang 1 angka. Pengguna lain di rumah mereka masing-masing langsung melihat stok buku tersebut berkurang secara instan tanpa perlu *refresh* halaman.
4. Jika anggota terlambat mengembalikan buku melewati batas 5 hari, aplikasi otomatis menghitung denda sebesar **Rp 5.000 untuk setiap hari** keterlambatan.
5. Saat anggota mengembalikan buku fisik ke perpustakaan, **Petugas Perpustakaan** menekan tombol **"Kembalikan Buku"** di dasbor komputernya.
6. Status peminjaman berubah menjadi **"Selesai"**, dan stok buku otomatis bertambah 1 angka kembali di rak digital katalog.

---

## 🔒 4. Keuntungan Sistem ini Bagi Orang Awam

1. **Sangat Ringan & Cepat:** Katalog buku tidak lemot saat dibuka karena ukuran sampul buku otomatis dikecilkan oleh sistem. Membuka perpustakaan digital ini terasa secepat membuka media sosial harian Anda.
2. **Hemat Paket Data (Internet):** Anggota tidak perlu takut kuota habis saat mengunggah foto KTP karena aplikasi otomatis memperkecil foto tersebut sebelum dikirim.
3. **Akun Aman Terlindungi:** Kata sandi akun dijaga oleh teknologi perlindungan dari Google, membuat akun Anda aman dari pencurian identitas.
4. **Informasi Transparan:** Anggota bisa langsung memantau dari rumah apakah stok buku favoritnya masih ada atau sedang kosong, serta melihat jumlah denda keterlambatan secara jelas di layar profil tanpa ada biaya tersembunyi.

---
> 💡 *Dokumen arsitektur versi sangat sederhana ini dirancang khusus agar konsep kecanggihan Salahuddin Library dapat langsung dipahami dengan mudah oleh siapa saja dalam sekali baca!*
