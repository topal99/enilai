# NilaiKu - Sistem Penilaian Murid Modern

Selamat datang di NilaiKu! Aplikasi ini dirancang untuk memodernisasi dan menyederhanakan proses penilaian akademik di sekolah. Dengan antarmuka yang bersih dan fitur-fitur canggih berbasis AI, NilaiKu membantu semua peran—Admin, Guru, Wali Kelas, dan Murid—untuk mengelola dan memantau kinerja akademik dengan lebih efisien.

Aplikasi ini dibangun menggunakan **Next.js** dan **ShadCN UI**, dengan backend yang dirancang untuk diintegrasikan dengan **Laravel**.

## Ringkasan Fitur per Peran

Berikut adalah rincian fitur yang tersedia untuk setiap peran dalam aplikasi.

---

### 1. Peran: Admin

Admin memiliki kontrol penuh atas seluruh sistem, mulai dari manajemen pengguna hingga pengaturan akademik global.

-   **Dasbor Admin (`/admin/dashboard`)**
    -   Menampilkan statistik kunci: Total Pengguna, Total Guru, Total Murid, dan Total Nilai yang Telah Diinput.
    -   Visualisasi komposisi pengguna (Admin, Guru, Murid, Wali Kelas) dalam bentuk diagram lingkaran (pie chart).
    -   Log aktivitas terbaru yang terjadi di dalam sistem untuk pemantauan cepat.

-   **Manajemen Pengguna (`/admin/users`)**
    -   Menampilkan daftar lengkap semua pengguna yang terdaftar di sistem.
    -   Menambahkan pengguna baru (murid, guru, admin) melalui sebuah dialog form.
    -   (Backend) Kemampuan untuk mengedit dan menghapus pengguna.

-   **Monitor Aktivitas (`/admin/activity`)**
    -   Menyediakan log audit yang terperinci dari semua aktivitas pengguna, termasuk waktu dan alamat IP.

-   **Pengaturan (`/admin/settings`)**
    -   **Pengaturan Akademik**: Mengatur semester yang sedang aktif untuk seluruh aplikasi. Perubahan ini akan memengaruhi data yang ditampilkan di semua peran.
    -   **Keamanan**: Mengubah kata sandi akun admin.
    -   **Notifikasi**: Mengelola preferensi notifikasi (misalnya, via email atau peringatan sistem).

-   **Profil (`/admin/profile`)**
    -   Memperbarui informasi profil pribadi admin, seperti nama dan email.
    -   Mengubah foto profil.

---

### 2. Peran: Guru

Guru dapat fokus pada tugas utama mereka: mengajar dan menilai. Fitur-fitur yang ada dirancang untuk mempercepat proses administrasi nilai.

-   **Dasbor Guru (`/teacher/dashboard`)**
    -   Menampilkan ringkasan statistik untuk semester aktif: jumlah mata pelajaran yang diajar, total murid, dan rata-rata nilai keseluruhan kelas.
    -   Menampilkan daftar 3 murid berprestasi teratas berdasarkan nilai rata-rata.
    -   Tautan cepat untuk langsung ke halaman input nilai.

-   **Input Nilai (`/teacher/grade-input`)**
    -   Formulir input nilai massal yang efisien.
    -   Alur kerja: Guru memilih Kelas -> Mata Pelajaran -> Jenis Ujian -> Tanggal.
    -   Setelah filter dipilih, tabel dinamis muncul berisi daftar semua murid di kelas tersebut, dengan kolom input nilai di samping setiap nama.
    -   Menyimpan semua nilai untuk satu kelas dalam satu kali aksi.

-   **Daftar Nilai (`/teacher/grades`)**
    -   Menampilkan tabel lengkap dari semua nilai yang pernah diinput oleh guru tersebut untuk semester aktif.
    -   Fitur filter interaktif berdasarkan Kelas, Mata Pelajaran, dan Jenis Ujian untuk memudahkan pencarian data spesifik.

-   **Rekomendasi AI (`/teacher/recommendation`)**
    -   Fitur canggih untuk mendapatkan rekomendasi penilaian.
    -   Guru mengunggah file tugas murid dan memasukkan kriteria penilaian.
    -   AI akan menganalisis file dan memberikan rekomendasi nilai beserta alasannya dalam bentuk poin-poin.

-   **Profil & Pengaturan (`/teacher/profile`, `/teacher/settings`)**
    -   Mengelola informasi profil pribadi dan mengubah kata sandi.

---

### 3. Peran: Wali Kelas (Homeroom)

Wali Kelas memiliki akses untuk memantau perkembangan akademik seluruh siswa di kelas perwaliannya dan bertanggung jawab atas pembuatan rapor.

-   **Dasbor Wali Kelas (`/homeroom/dashboard`)**
    -   Menampilkan ringkasan jumlah siswa dan mata pelajaran di sekolah.
    -   Tautan cepat untuk langsung menuju halaman rapor siswa.

-   **Rapor Siswa (`/homeroom/report`)**
    -   Halaman utama untuk memantau dan membuat rapor.
    -   Wali kelas memilih siswa dari daftar untuk melihat detail nilai mereka.
    -   Menampilkan rekapitulasi nilai lengkap siswa per mata pelajaran (ulangan harian, tugas, UTS, UAS) dan nilai rata-ratanya.
    -   Visualisasi nilai siswa dalam bentuk diagram batang (bar chart).
    -   **Fitur AI**: Kemampuan untuk menghasilkan catatan/komentar rapor secara otomatis berdasarkan data nilai siswa. AI akan memberikan ringkasan, daftar kekuatan, area peningkatan, dan rekomendasi.

-   **Profil & Pengaturan (`/homeroom/profile`, `/homeroom/settings`)**
    -   Mengelola informasi profil pribadi dan mengubah kata sandi.

---

### 4. Peran: Murid

Murid dapat dengan mudah memantau kemajuan akademik mereka sendiri.

-   **Dasbor Murid (`/student/dashboard`)**
    -   Menampilkan kartu selamat datang dengan informasi kelas dan semester aktif.
    -   Menampilkan daftar 3 nilai terbaru yang diperoleh.
    -   Menampilkan kartu berisi nilai rata-rata dari semua mata pelajaran di semester ini.
    -   Tautan cepat untuk melihat semua nilai.

-   **Nilai Saya (`/student/grades`)**
    -   Menampilkan daftar lengkap semua nilai yang diperoleh di semester aktif dalam format tabel yang rapi.
    -   Informasi mencakup mata pelajaran, nama guru, jenis ujian, tanggal, dan skor yang didapat.

-   **Profil & Pengaturan (`/student/profile`, `/student/settings`)**
    -   Halaman profil menampilkan informasi akun (nama, email, peran) yang tidak dapat diubah.
    -   Menyediakan formulir khusus bagi murid untuk mengubah kata sandi akun mereka.
---