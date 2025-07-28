# NilaiKu - Sistem Penilaian Akademik

![](frontend/public/images/herosection.png)

NilaiKu adalah sebuah aplikasi modern yang dirancang untuk menyederhanakan dan memodernisasi proses penilaian akademik di institusi pendidikan. Dibangun dengan teknologi terkini, NilaiKu menyediakan platform yang intuitif dan powerful bagi seluruh ekosistem sekolah: Admin, Guru, Wali Kelas, dan Murid.

## Teknologi yang Digunakan

Aplikasi ini dikembangkan menggunakan arsitektur **monolitik** dengan pemisahan logis antara Frontend dan Backend:

-   **Frontend:** Dibangun dengan **Next.js**, sebuah *framework* React yang *powerful* untuk membuat aplikasi web *full-stack*. Antarmuka pengguna diperkaya dengan komponen-komponen dari **ShadCN UI** dan styling menggunakan **Tailwind CSS**.
    -   Versi Next.js: `14.x.x`
    -   Versi React: `18.x.x`
    -   Versi Node.js: `18.x.x` atau lebih tinggi

-   **Backend:** Dibangun dengan **Laravel**, *framework* PHP yang tangguh untuk pengembangan aplikasi web. Laravel menyediakan API yang aman dan efisien untuk mendukung fungsionalitas Frontend.
    -   Versi Laravel: `10.x.x`
    -   Versi PHP: `8.1.x` atau lebih tinggi
    -   Database: Direkomendasikan menggunakan **MySQL** atau **PostgreSQL**.

## Instalasi Proyek

Ikuti langkah-langkah di bawah ini untuk menginstal dan menjalankan proyek NilaiKu di lingkungan lokal Anda.

### Prerequisites

Pastikan Anda telah menginstal perangkat lunak berikut:

-   Node.js (`18.x` atau lebih tinggi) & npm/yarn
-   PHP (`8.1` atau lebih tinggi)
-   Composer
-   Server Basis Data (MySQL atau PostgreSQL)
-   Server Web (Apache, Nginx, atau PHP built-in server)

### Langkah-langkah Instalasi Backend (Laravel)

1.  Masuk ke direktori backend:
    ```bash
    cd backend
    ```

2.  Instal dependensi PHP menggunakan Composer:
    ```bash
    composer install
    ```

3.  Salin file environment:
    ```bash
    cp .env.example .env
    ```

4.  Edit file `.env` dan konfigurasi koneksi database Anda.

5.  Buat *application key*:
    ```bash
    php artisan key:generate
    ```

6.  Jalankan migrasi database:
    ```bash
    php artisan migrate
    ```

7.  (Opsional) Jalankan seeder untuk data dummy:
    ```bash
    php artisan db:seed
    ```

8.  Jalankan server Laravel (untuk pengembangan):
    ```bash
    php artisan serve
    ```

    Backend akan berjalan di `http://127.0.0.1:8000` secara default.

### Langkah-langkah Instalasi Frontend (Next.js)

1.  Masuk ke direktori frontend pada terminal baru:
    ```bash
    cd frontend
    ```

2.  Instal dependensi JavaScript menggunakan npm atau yarn:
    ```bash
    npm install
    # atau yarn install
    ```

3.  Salin file environment:
    ```bash
    cp .env.local.example .env.local
    ```

4.  Edit file `.env.local` dan sesuaikan variabel lingkungan jika diperlukan (misalnya, URL backend API).

5.  Jalankan server pengembangan Next.js:
    ```bash
    npm run dev
    # atau yarn dev
    ```

    Frontend akan berjalan di `http://localhost:3000` secara default.

Pastikan backend dan frontend berjalan secara bersamaan untuk fungsionalitas penuh.

## Fitur Detail per Peran Pengguna

NilaiKu dirancang dengan empat peran pengguna utama, masing-masing dengan serangkaian fitur yang disesuaikan dengan kebutuhan mereka:

---

### 1. Admin

Peran Admin memiliki kendali penuh atas sistem, bertanggung jawab untuk manajemen pengguna, konfigurasi sistem, dan pemantauan aktivitas global.

-   **Dasbor Komprehensif (`/admin/dashboard`)**
    -   Ringkasan statistik utama: Jumlah total pengguna, guru, siswa, dan nilai yang tercatat.
    -   Diagram visualisasi distribusi peran pengguna dalam sistem.
    -   Tampilan *real-time* log aktivitas terbaru untuk pengawasan.

-   **Manajemen Pengguna (`/admin/manage-admin`, `/admin/manage-teachers`, `/admin/manage-students`, `/admin/manage-homerooms`)**
    -   Antarmuka terpisah untuk mengelola masing-masing tipe pengguna (Admin, Guru, Murid, Wali Kelas).
    -   Menambahkan pengguna baru dengan data spesifik sesuai peran.
    -   (Backend) Fungsionalitas lengkap untuk mengedit, menghapus, dan mengelola detail profil pengguna.

-   **Monitor Aktivitas (`/admin/activity`)**
    -   Log audit terperinci dari setiap aksi yang dilakukan pengguna, termasuk *timestamp* dan informasi relevan.

-   **Pengaturan Sistem (`/admin/settings`)**
    -   Mengatur semester yang sedang aktif untuk seluruh aplikasi.
    -   Mengelola pengaturan global lainnya yang memengaruhi perilaku sistem.
    -   Opsi keamanan seperti perubahan kata sandi admin.

-   **Profil Admin (`/admin/profile`)**
    -   Mengelola informasi pribadi dan foto profil admin.

---

### 2. Guru

Peran Guru difokuskan pada pengelolaan data nilai siswa dan memanfaatkan fitur bantuan AI untuk efisiensi.

-   **Dasbor Guru (`/teacher/dashboard`)**
    -   Statistik ringkas semester aktif: Jumlah mata pelajaran yang diajar, total siswa yang dinilai, rata-rata nilai kelas.
    -   Identifikasi dan tampilan 3 siswa dengan pencapaian akademik tertinggi.
    -   Akses cepat ke halaman input nilai.

-   **Input Nilai Efisien (`/teacher/grade-input`)**
    -   Formulir input massal yang memudahkan pengisian nilai untuk seluruh kelas sekaligus.
    -   Filter dinamis berdasarkan Kelas, Mata Pelajaran, Jenis Nilai (Ulangan Harian, Tugas, UTS, UAS), dan Tanggal Ujian.
    -   Setelah filter diterapkan, tabel menampilkan daftar siswa dengan kolom input nilai yang dapat langsung diisi.
    -   Proses penyimpanan nilai yang disederhanakan.

-   **Daftar Nilai Terorganisir (`/teacher/grades`)**
    -   Tabel komprehensif yang menampilkan semua nilai yang telah diinput oleh guru tersebut.
    -   Fitur filter berdasarkan Kelas, Mata Pelajaran, dan Jenis Nilai untuk pencarian data yang cepat dan akurat.

-   **Rekomendasi Penilaian Berbasis AI (`/teacher/recommendation`)**
    -   Unggah dokumen tugas atau hasil kerja siswa.
    -   Masukkan kriteria penilaian yang relevan.
    -   Sistem AI akan menganalisis dokumen dan memberikan rekomendasi nilai beserta penjelasan poin per poin sebagai dasar pertimbangan guru.

-   **Profil & Pengaturan Guru (`/teacher/profile`, `/teacher/settings`)**
    -   Mengelola detail profil pribadi dan opsi perubahan kata sandi.

---

### 3. Wali Kelas (Homeroom)

Wali Kelas berperan dalam memantau perkembangan akademik siswa di kelas perwaliannya dan bertanggung jawab dalam pembuatan serta pengelolaan rapor.

-   **Dasbor Wali Kelas (`/homeroom/dashboard`)**
    -   Informasi jumlah siswa di kelas perwalian dan mata pelajaran yang diambil.
    -   Akses langsung ke halaman laporan/rapor siswa.

-   **Manajemen Rapor Siswa (`/homeroom/report`, `/homeroom/report/[studentId]`)**
    -   Daftar siswa di kelas perwalian untuk pemilihan dan peninjauan rapor.
    -   Tampilan detail nilai siswa per mata pelajaran, mencakup semua jenis penilaian.
    -   Visualisasi nilai siswa dalam bentuk grafik (misalnya, diagram batang) untuk analisis cepat.
    -   **Fitur Pembuatan Catatan Rapor AI**: Menghasilkan draf catatan atau komentar rapor secara otomatis berdasarkan performa akademik siswa (kekuatan, area pengembangan, saran).

-   **Profil & Pengaturan Wali Kelas (`/homeroom/profile`, `/homeroom/settings`)**
    -   Mengelola informasi profil dan opsi perubahan kata sandi.

---

### 4. Murid

Peran Murid memungkinkan siswa untuk secara aktif memantau dan melacak kemajuan akademik mereka sendiri.

-   **Dasbor Murid (`/student/dashboard`)**
    -   Sambutuan personal dengan informasi kelas dan semester aktif.
    -   Tampilan singkat 3 nilai terbaru yang diperoleh.
    -   Kartu ringkasan nilai rata-rata semester.
    -   Tautan cepat untuk melihat semua detail nilai.

-   **Akses Nilai (`/student/grades`)**
    -   Tabel yang rapi dan mudah dibaca berisi semua nilai yang diperoleh siswa pada semester aktif.
    -   Informasi mencakup Nama Mata Pelajaran, Nama Guru, Jenis Penilaian, Tanggal Ujian, dan Skor yang didapat.

-   **Profil & Pengaturan Murid (`/student/profile`, `/student/settings`)**
    -   Halaman profil menampilkan informasi dasar yang tidak dapat diubah (nama, email, peran).
    -   Formulir khusus untuk mengubah kata sandi akun.

---

NilaiKu bertujuan untuk menjadi solusi komprehensif dalam digitalisasi proses penilaian, meningkatkan transparansi, dan mendukung kolaborasi antara seluruh komponen sekolah demi kemajuan akademik siswa.