import { Prisma } from "@prisma/client";

export interface ApiResponse<T> {
   status: "success" | "error";
   data: T | null;
   meta: any | null;
   error: {
      message: string;
      code: number;
   } | null;
}

export interface JwtPayloadToken {
   userId: number;
   role: string;
}

export interface PaginationMeta {
   total: number;
   page: number;
   limit: number;
}

export interface PendaftaranZonasiResponse {
   pendaftaran_id: number;
   sekolah_id: number;
   sekolah_nama: string;
   siswa_id: number;
   siswa_nama: string;
   nisn: string;
   sekolah_asal_nama: string;
   jarak_lurus: number;
   jarak_rute: number,
   status: string;
   status_kelulusan: string;
}

export interface GetAllJadwalRequest {
   periode_jalur_id: number
   waktu_mulai: string,
   waktu_selesai: string,
   tahapan_nama: string,
   is_closed: number,
   jadwal_id: number
}

export interface GetKelulusanSiswa {
   pendaftaran_id: number;
   siswa_id: number;
   nama: string;
   nisn: string;
   sekolah_asal_id: number;
   sekolah_asal_nama: string;
   status_kelulusan: "PENDAFTARAN" | "LULUS" | "TIDAK_LULUS"
}

export interface GetTotalPendaftaranBySekolah {
   sekolah_id: number;
   sekolah_nama: string;
   npsn: string;
   totalPendaftar: number;
   kuota: number
}

export interface GetLaporanPendaftaran {
   // siswa_id: number;
   nama: string;
   nik: string;
   nisn: string;
   alamat_kk: string;
   alamat_tinggal: string;
   tanggal_lahir: Date;
   nomor_telepon: string;
   jenis_kelamin: "L" | "P";
   agama: string;
   sekolah_asal: string;
   sekolah_tujuan: string;
   desa: string;
   banjar: string;
   status_kelulusan: string;
   umur_siswa: number;
   jarak_lurus: number;
   jarak_rute: number;
}

export interface GetLaporanDashboardSd {
   total_siswa: number;
   total_user: number;
   total_terdaftar: number;
   total_lulus: number;
   total_terverifikasi: number;
   total_belum_terverifikasi: number;
   total_biodata_belum_lengkap: number;
   total_dokumen_belum_lengkap: number;
}

export interface GetLaporanDashboardSmp {
   total_siswa_terdaftar: number;
   total_terverifikasi: number;
   total_belum_terverifikasi: number;
   total_lulus: number;
}

export interface GetLaporanDashboardDinas {
   total_siswa: number;
   total_sekolah_sd: number;
   total_sekolah_smp: number;
   total_terdaftar: number;
   total_terverifikasi: number;
   total_belum_terverifikasi: number;
   total_lulus: number;
   total_tidak_lulus: number;
}

export interface GetTotalPendaftarPerSekolah {
   sekolah_id: number;
   sekolah_nama: string;
   total_pendaftar: number;
}

export type orderByParam = {
   field: keyof Prisma.PendaftaranOrderByWithRelationInput,
   direction: 'asc' | 'desc'
}

export type rankingMethod = "jarak_lurus" | "jarak_rute"