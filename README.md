<<<<<<< HEAD
# Web BEM IKIP PGRI Bojonegoro - Kabinet Winatra (v2, front-end baru)

HTML5, CSS3, JavaScript ES6+, Bootstrap 5.3 dan Bootstrap Icons (CDN). Tanpa build tool, siap untuk GitHub Pages/Netlify.

## Struktur
- `index.html` : kerangka, navbar offcanvas, modal, toast. Tidak ada konfigurasi di sini.
- `css/style.css` : token tema (variabel CSS), komponen semi-pixel, animasi, responsif.
- `js/config.js` : **alamat database (URL Web App) diisi di sini** (`window.WINATRA_API`).
- `js/app.js` : router hash, API, halaman, dasbor, modal, toast. `js/demo-data.js` : data contoh.
- `Code.gs` : backend Apps Script, TIDAK diubah. `assets/` : logo dan ikon PNG transparan.

## Pemasangan backend
Sama seperti versi sebelumnya: tempel `Code.gs` di Apps Script, jalankan `setup`, deploy sebagai Web app, salin URL `/exec` ke `window.WINATRA_API` di `js/config.js`.

## Mode demo
Jika `WINATRA_API` di `js/config.js` masih `GANTI_DENGAN_URL_WEB_APP`, situs memakai data contoh dan muncul label "Mode demo". Login demo: lihat bagian Halaman Admin dan Ormawa. Perubahan disimpan sementara di sesi browser.

## Sudah diuji
Render Chromium (Playwright) di 360, 390, 768, 1024, 1440 px pada beranda, struktur, event, kementerian, e-book, template, login, dan dasbor admin (mode demo): tanpa error JS dan tanpa scroll horizontal. Screenshot beranda dan struktur diperiksa manual.

## Belum diuji / belum ada
- Backend Google Apps Script asli (login, simpan, hapus), thumbnail Google Drive, dan perangkat HP fisik.
- Bootstrap Icons diuji tanpa file font, jadi ikon belum terlihat di pengujian (di hosting biasanya muncul dari CDN).
- Belum ada: tab pengguna dengan validasi tambahan, bagan struktur dengan garis penghubung penuh antara Wapres dan Sekretaris di mobile, kompresi gambar otomatis, dan pengujian kontras dengan alat otomatis.
- Dasbor ormawa: status proker/event otomatis dan filter pemilik tetap ditangani `Code.gs`.

## Halaman Admin dan Ormawa
- `admin.html` : dasbor super admin. `ormawa.html` : dasbor ormawa.
- Navbar publik hanya punya tombol **Masuk**. Setelah login, otomatis dibuka `admin.html` atau `ormawa.html` sesuai peran. Membuka halaman itu tanpa login mengembalikan ke halaman Masuk.
- Mode demo: admin / `admin123`, ormawa / `ormawa123`.
- Mode asli: username `admin`, sandi ada di Execution log Apps Script setelah menjalankan `setup`.

## Pembaruan: peran Kemahasiswaan
- Tiga peran: ormawa (kirim proker), super admin BEM (acc proker), kemahasiswaan (putusan akhir).
- Alur: ormawa kirim proker (Ditinjau) → BEM: Diterima / Revisi / Ditolak + catatan → hanya yang Diterima tampil di
  `kemahasiswaan.html` → Kemahasiswaan: Disetujui / Revisi / Ditolak + keterangan → ormawa melihat catatan BEM dan Kemahasiswaan di dasbornya.
- Revisi oleh ormawa mengembalikan proker ke status Ditinjau (catatan lama dikosongkan).
- JANGAN mengunggah Code.gs atau daftar akun ke hosting. Berkas itu hanya untuk Apps Script.

## Menu admin (BEM)
- **Tinjau Proker Ormawa**: daftar proker ormawa dengan tombol Tinjau (lihat detail, buka dokumen, putuskan Diterima / Revisi / Ditolak + catatan).
- **Proker BEM**: BEM mengunggah proker kegiatannya sendiri; otomatis diteruskan ke Kemahasiswaan.

## Pembaruan final
- Setelah mengganti Code.gs: jalankan `setup` sekali (menambah kolom arsip dan foto, serta sheet `pejabat`), lalu deploy versi baru.
- Foto pejabat: isi tautan Google Drive (akses "siapa saja yang memiliki link") di tab Pejabat Pimpinan dan Kementerian (admin).
- Ormawa tidak bisa menghapus data; gunakan Arsipkan (program selesai) dan Aktifkan untuk membatalkan.
- Logo coklat vektor: assets/logo/kabinet-winatra-coklat.svg (navbar dan hero). Footer memakai logo berwarna asli.
=======
# Web-Sekretariat-Digital-Winatra
Web Sekretariat Digital Winatra
>>>>>>> a2767424041fdd191815b98706ca4fdf0549e679
