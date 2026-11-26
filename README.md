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

## Pembaruan v6
- Struktur dirombak: ringkas, berlogo, menampilkan menteri beserta departemen. Presiden dan Wakil Presiden dipisah (juga di halaman Kementerian).
- Tab admin "Struktur: Pimpinan" (sheet `pejabat`) = Presiden, Wapres, Sekretaris Kabinet, DPP, Staf Khusus. Tab "Tim Web" (sheet `tim`) = susunan tim pengembang web.
- Jika sheet `pejabat` berisi data salah, jalankan fungsi `resetPejabat` di Apps Script.
- Corak pixel-batik pada pembatas antar-section dan header halaman.
- Hapus dari repo: Code.gs, app.js, dan style.css di root (sisa versi lama, tidak dipakai).

## Pembaruan v6.2
- Struktur: tanpa kotak Lembaga, Dewan Pertimbangan dan Staf Khusus tidak ditampilkan, Sekretaris Kabinet di samping Wapres (tanpa kotak). Halaman Kementerian tidak lagi memuat Presiden/Wapres.
- Panel admin: tab **Struktur** menampilkan semua nama di halaman Struktur (pimpinan, menteri, pejabat departemen); ubah nama dan foto langsung dari sini. Tambah/hapus departemen lewat tab Kementerian.
- Hero beranda bermotif batik. Halaman Masuk menampilkan Winatra Card (data akun disamarkan, `assets/img/winatra-card-sensor.png`).

## Alur event (v6.7)
Ormawa kirim event (Menunggu) → admin BEM, tab **Tinjau Event**: Disetujui / Revisi / Ditolak.
- **Disetujui**: status jadi Tayang, langsung muncul di halaman Event web, dan pindah ke tab **Event** admin.
- **Revisi / Ditolak**: wajib isi catatan; ormawa langsung melihatnya di kolom Catatan dasbornya. Setelah ormawa mengubah event, status otomatis kembali Menunggu dan catatan dikosongkan.
- **Selesai**: di tab Event admin klik **Arsipkan**; event otomatis hilang dari web (bisa diaktifkan lagi dari tab Arsip).

**Wajib di Apps Script (sekali saja):** tambahkan kolom `catatan` pada sheet `event`.
1. Di `Code.gs` (yang ada di Apps Script), pada `SCHEMA` baris `event:[...]`, tambahkan `'catatan'` di PALING AKHIR array (setelah `'arsip'` jika ada).
2. Jalankan fungsi `setup` sekali. Jika kolom tidak muncul otomatis, ketik `catatan` di sel header paling kanan sheet `event`.
3. Deploy > Kelola deployment > Edit > Versi baru > Deploy.
Tanpa kolom ini, keputusan Disetujui tetap jalan, tetapi Revisi/Ditolak ditolak dengan pesan yang jelas.

## Proposal Kegiatan dan LPJ (v7)
- **Proposal Kegiatan** mengikuti format ajuan: nama kegiatan, nama PJ, WhatsApp PJ, tanggal pelaksanaan, tanggal ajuan (otomatis), nominal ajuan dana, dan unggah proposal berjenis **Dana** atau **Non Dana** (nominal hanya untuk Dana).
- **LPJ** mengikuti format LPJ: ditambah nominal ajuan, **nominal di-ACC** (diisi Kemahasiswaan), dan tautan LPJ Dana atau Non Dana. Kegiatan bisa dipilih dari proposal yang sudah disetujui Kemahasiswaan, datanya terisi otomatis.
- **Alur sama untuk proposal dan LPJ**: ormawa kirim (Ditinjau) -> BEM: Diterima / Revisi / Ditolak + catatan -> bila Diterima, masuk Kemahasiswaan: Disetujui / Revisi / Ditolak + keterangan (+ nominal ACC untuk LPJ Dana) -> ormawa melihat semua catatan di dasbornya. Mengubah dokumen = kirim ulang dari awal.
- **Kritik dan saran** (khusus LPJ) hanya dibaca BEM. Dibuang di sisi server dari semua data Kemahasiswaan, bukan hanya disembunyikan di tampilan.
- Admin: tab Tinjau Proposal, Tinjau LPJ, Proposal BEM, LPJ BEM (dokumen BEM sendiri langsung ke Kemahasiswaan).
- Wajib setelah mengganti Code.gs: jalankan `setup` sekali (membuat sheet `lpj` dan kolom `jenis` pada sheet `proker`), lalu deploy versi baru.
