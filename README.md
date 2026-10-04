# FamMap

FamMap adalah aplikasi interaktif untuk mengelola silsilah keluarga, memetakan hubungan kekerabatan, dan menyusun profil keluarga dalam canvas visual.

## Fitur

- Login menggunakan Supabase Auth.
- Canvas silsilah interaktif berbasis React Flow.
- Relasi ayah, ibu, anak, pasangan, dan pernikahan.
- Perhitungan panggilan kekerabatan dalam bahasa Indonesia.
- Tambah, edit, hapus, dan cari profil keluarga.
- Pemilihan banyak profil dengan Shift atau Ctrl/Cmd.
- Mode Grid untuk merapikan posisi profil.
- Posisi profil tersimpan di Supabase.
- Antarmuka claymorphism yang responsif.

## Teknologi

- Next.js 16 dengan App Router
- React 19 dan TypeScript
- Supabase Auth dan database PostgreSQL
- React Flow
- Tailwind CSS
- Framer Motion dan Lucide React

## Persiapan

Pastikan Node.js 20 atau versi yang lebih baru sudah terpasang.

1. Clone repository dan masuk ke folder proyek.

```bash
git clone <url-repository> fammap-dumci
cd fammap-dumci
npm install
```

2. Buat project Supabase, lalu jalankan seluruh isi [`supabase_init.sql`](./supabase_init.sql) melalui SQL Editor Supabase.

3. Aktifkan Email provider pada Supabase Auth dan buat akun pengguna untuk login.

4. Buat file `.env.local` pada root proyek:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` hanya digunakan di server dan tidak boleh dikirim ke client atau di-commit ke repository.

## Menjalankan

Mode development:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000), kemudian login menggunakan akun Supabase.

Validasi production:

```bash
npm run lint
npm run build
npm start
```

## Penggunaan Canvas

- Klik profil untuk membuka detail anggota.
- Tahan Shift, lalu klik beberapa profil untuk memilih banyak profil.
- Geser salah satu profil yang terpilih untuk memindahkan semuanya.
- Aktifkan `Mode Grid` untuk mengunci perpindahan pada jarak grid.
- Posisi akan disimpan otomatis setelah profil dipindahkan.

## Struktur Data

- `persons`: biodata dan relasi orang tua.
- `marriages`: hubungan pasangan dan status pernikahan.
- `person_positions`: posisi x dan y profil pada canvas.

API aplikasi tersedia pada:

- `/api/persons`
- `/api/persons/[id]`
- `/api/marriages`
- `/api/person-positions`

## Struktur Proyek

```text
app/          Halaman, layout, dan API routes
components/   Komponen canvas, node, modal, dan input
lib/          Client Supabase dan rate limiter
types/        Tipe data keluarga
utils/        Layout tree dan kalkulator kekerabatan
styles/       Gaya claymorphism
```

## Lisensi

Lisensi proyek dapat ditambahkan sesuai kebutuhan repository.
