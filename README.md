# Food Analysis App (Mobile Web)

Aplikasi web sederhana untuk menganalisis makanan menggunakan Google Gemini API. Dibuat dengan HTML, CSS, dan Vanilla JavaScript.

## 🔴 Live Demo

Buka di: [https://USERNAME.github.io/Food-Analysis-App/](https://USERNAME.github.io/Food-Analysis-App/) _(ganti USERNAME dengan username GitHub kamu)_

## 🚀 Cara Menjalankan

1. Buka file `index.html` di browser (klik dua kali atau lewat Live Server).
2. Saat pertama kali dibuka, akan muncul form untuk memasukkan **API Key Google Gemini**.
   - Jika belum punya, dapatkan di: [aistudio.google.com](https://aistudio.google.com/apikey)
3. Masukkan API Key dan klik **Simpan**.
4. API Key disimpan di `localStorage` (browser kamu saja, tidak dikirim ke server manapun selain Google API).
5. Kamu bisa mengubah API Key kapan saja lewat tombol ⚙️ di header.

## 📱 Tampilan Mobile

Aplikasi ini didesain dengan konsep **Mobile First**.

- Jika dibuka di Desktop, aplikasi akan tampil di tengah layar menyerupai frame HP.
- Jika dibuka di HP, akan otomatis full-screen.

## 🔒 Keamanan

- API Key **TIDAK** disimpan di source code.
- API Key disimpan di `localStorage` browser pengguna masing-masing.
- Aman untuk di-deploy ke GitHub Pages (public repository).

## 🌐 Deploy ke GitHub Pages

1. Push kode ke repository GitHub.
2. Buka **Settings** → **Pages** → Pilih Branch `main`, Folder `/ (root)`.
3. Klik **Save**. Setelah beberapa menit, aplikasi live! 🎉

## Ikon

Menggunakan [Ionicons](https://ionic.io/ionicons) secara online (CDN). Pastikan internet aktif saat membuka aplikasi.
