import { Prisma } from "@prisma/client";
import { prisma } from "../utils/database";

export class PengumumanRepository {
   static async findAllPendaftaranZonasi(whereClause: Prisma.PendaftaranWhereInput, skip: number, limit: number) {
      return prisma.pendaftaran.findMany({
         where: whereClause,
         orderBy: {status_kelulusan: "asc"},
         skip: skip,
         take: limit,
         select: {
            pendaftaran_id: true,
            periode_jalur_id: true,
            siswa_id: true,
            siswa: {
               select: {
                  nama: true,
                  nisn: true,
                  sekolah_asal: {
                     select: {
                        sekolah_nama: true
                     }
                  }
               }
            },
            sekolah_id: true,
            sekolah_tujuan: {
               select: {
                  sekolah_nama: true
               }
            },
            jarak_rute: true,
            jarak_lurus: true,
            status: true,
            status_kelulusan: true,
         },
      });
   }

   static async countAllPendaftaranZonasi(whereClause: Prisma.PendaftaranWhereInput) {
      return prisma.pendaftaran.count({
         where: whereClause
      })
   }

   static async findZonasiKuota(sekolahId: number, jenisKuota: string) {
      return prisma.kuotaSekolah.findFirst({
         where: { 
            sekolah_id: sekolahId,
            jenis_kuota: { jenis_kuota: jenisKuota } 
         },
         select: {
            kuota: true
         }
      });
   }

   static async findPeriodeJalur(periode_jalur_id: number) {
      return prisma.periodeJalur.findUnique({
         where: { periode_jalur_id: periode_jalur_id },
         select: {
            periode_jalur_id: true,
            jalur: {
               select: {
                  jalur_nama: true
               }
            },
            metode_ranking: true
         }
      })
   }

   static async findPeriodeJalurByPeriodeId(periodeId: number) {
      return prisma.periodeJalur.findMany({
         where: {
            periode_id: periodeId,
         },
         select: {
            periode_jalur_id: true,
            jalur: {
               select: {
                  jalur_nama: true
               }
            }
         }
      })
   }

   static async findPendaftaranLulus<T extends Prisma.PendaftaranSelect>(
      limit: number,
      skip: number,
      whereClause: any,
      orderBy: any, 
      select: T
   ): Promise<Prisma.PendaftaranGetPayload<{ select: T }>[]> {
      return prisma.pendaftaran.findMany({
         where: whereClause,
         orderBy: orderBy,
         take: limit,
         skip: skip,
         select: select
      }) as any
   }

   static async countPendaftaranSiswa(whereClause: any) {
      return prisma.pendaftaran.count({
         where: whereClause
      })
   }

   static async updateStatusKelulusan(pendaftaranIds: number[]) {
      return prisma.pendaftaran.updateMany({
         where: {
            pendaftaran_id: {
               in: pendaftaranIds,
            },
         },
         data: {
            status_kelulusan: "LULUS",
         },
      });
   }

   static async updateTidakLulus(sekolahId: number, pendaftaranIds: number[], periodeJalurId: number) {
      return prisma.pendaftaran.updateMany({
         where: {
            sekolah_id: sekolahId,
            periode_jalur_id: periodeJalurId,
            NOT: {
               pendaftaran_id: {
                  in: pendaftaranIds
               }
            }
         },
         data: {
            status_kelulusan: "TIDAK_LULUS"
         }
      })
   }

   static async findAllLaporanPendaftaran(whereClause: Prisma.PendaftaranWhereInput) {
      return prisma.pendaftaran.findMany({
         where: whereClause,
         orderBy: [
            { umur_siswa: 'desc'},
            { jarak_lurus: 'asc'},
            { jarak_rute: 'asc'}
         ],
         select: {
            pendaftaran_id: true,
            sekolah_id: true,
            siswa_id: true,
            status_kelulusan: true,
            umur_siswa: true,
            jarak_lurus: true,
            jarak_rute: true,
            sekolah_tujuan: {
               select: {
                  sekolah_nama: true
               }
            },
            siswa: {
               select: {
                  nama: true,
                  nik: true,
                  nisn: true,
                  jenis_kelamin: true,
                  alamat_kk: true,
                  alamat_tinggal: true,
                  tanggal_lahir: true,
                  nomor_telepon: true,
                  m_agama: {
                     select: {
                        nama_agama: true
                     }
                  },
                  sekolah_asal: {
                     select: {
                        sekolah_nama: true
                     }
                  },
                  desa: {
                     select: {
                        desa_nama: true
                     }
                  },
                  banjar: {
                     select: {
                        banjar_nama: true
                     }
                  }
               }
            }
         }
      })
   }

   static async findAllPendaftaranZonasiSekolahCount(periodeJalurId: number, sekolahIds: number[]) {
      return prisma.pendaftaran.groupBy({
         by: ["sekolah_id"],
         where: {
            sekolah_id: {
               in: sekolahIds
            },
            periode_jalur_id: periodeJalurId
         },
         _count: {
            pendaftaran_id: true
         },
         orderBy: {
            sekolah_id: "asc"
         }
      })
   }

   static async findAllSekolahSMP(skip: number, limit: number, whereClause: any) {
      return prisma.sekolah.findMany({
         where: whereClause,
         skip: skip,
         take: limit,
         select: {
            sekolah_id: true,
            sekolah_nama: true,
            npsn: true,
         }
      })
   }

   static async countAllSekolahSMP(whereClause: any) {
      return prisma.sekolah.count({
         where: whereClause
      })
   }
   
   static async findAllKuotaSekolah(periodeId: number, sekolahIds: number[]) {
      return prisma.kuotaSekolah.findMany({
         where: {
            sekolah_id: {
               in: sekolahIds
            },
            periode_id: periodeId,
            jenis_kuota: {
               jenis_kuota: "kuota_zonasi"
            }
         },
         select: {
            sekolah_id: true,
            kuota: true
         }
      })
   }

   static async countSiswaBySekolahId(sekolahId: number) {
      return prisma.siswa.count({
         where: { sekolah_asal_id: sekolahId }
      })
   }

   static async countUserSiswaBySekolahId(sekolahId: number) {
      return prisma.siswa.count({
         where: { 
            sekolah_asal_id: sekolahId,
            AND: {
               NOT: {
                  user_id: null
               }
            } 
         },
      
      })
   }

   static async countSiswaTerdaftar(sekolahId: number, periodeJalurId: number) {
      return prisma.pendaftaran.count({
         where: {
            siswa: {
               sekolah_asal_id: sekolahId
            },
            periode_jalur_id: periodeJalurId
         }
      })
   }

   static async countSiswaLulus(sekolahId: number, periodeJalurId: number) {
      return prisma.pendaftaran.count({
         where: {
            siswa: {
               sekolah_asal_id: sekolahId
            },
            periode_jalur_id: periodeJalurId,
            status_kelulusan: "LULUS"
         }
      })
   }

   static async countSiswaVerifikasi(sekolahId: number, periodeJalurId: number, status: "VERIF_SD" | "VERIF_SMP") {
      return prisma.pendaftaran.count({
         where: {
            siswa: {
               sekolah_asal_id: sekolahId
            },
            periode_jalur_id: periodeJalurId,
            status: status
         }
      })
   }

   static async countDokumenSiswaBelumLengkap(sekolahId: number): Promise<[{count: number}]> {
      return prisma.$queryRaw`
         SELECT COUNT(s.siswa_id) as count
         FROM m_siswas s 
         LEFT JOIN (
            SELECT siswa_id,
            COUNT(*) AS dokumen_count
            FROM dokumen_siswa
            GROUP BY siswa_id
         ) AS ds ON ds.siswa_id = s.siswa_id
         WHERE s.sekolah_asal_id = ${sekolahId}
         AND COALESCE(ds.dokumen_count, 0) < 4
      `
   }

   static async countBiodataSiswaBelumLengkap(sekolahId: number): Promise<[{count: number}]> {
      return prisma.$queryRaw`
         SELECT COUNT(siswa_id) as count
         FROM m_siswas s 
         WHERE s.sekolah_asal_id = ${sekolahId}
         AND (
            s.provinsi_id IS NULL OR 
            s.kabupaten_id IS NULL OR 
            s.kecamatan_id IS NULL OR 
            s.desa_id IS NULL OR 
            s.banjar_id IS NULL OR
            s.tanggal_lahir IS NULL
         )
      `
   }

   static async countTotalSiswaTerdaftar(sekolahId: number, periodeJalurId: number) {
      return prisma.pendaftaran.count({
         where: {
            sekolah_id: sekolahId,
            periode_jalur_id: periodeJalurId
         }
      })
   }

   static async countSiswaVerifikasiSmp(
      sekolahId: number, 
      periodeJalurId: number, 
      status: "VERIF_SD" | "VERIF_SMP"
   ) {
      return prisma.pendaftaran.count({
         where: {
            sekolah_id: sekolahId,
            periode_jalur_id: periodeJalurId,
            status: status
         }
      })
   }

   static async countSiswaLulusSmp(
      sekolahId: number, 
      periodeJalurId: number
   ) {
      return prisma.pendaftaran.count({
         where: {
            sekolah_id: sekolahId,
            periode_jalur_id: periodeJalurId,
            status_kelulusan: "LULUS"
         }
      })
   }

   static async countAllSiswaTerdaftar(periodeJalurId: number) {
      return prisma.pendaftaran.count({
         where: { periode_jalur_id: periodeJalurId }
      })
   }

   static async countAllSiswaVerifikasi(periodeJalurId: number, status: "VERIF_SD" | "VERIF_SMP") {
      return prisma.pendaftaran.count({
         where: { 
            periode_jalur_id: periodeJalurId,
            status: status
         }
      })
   }

   static async countAllSiswaLulus(periodeJalurId: number, status: "LULUS" | "TIDAK_LULUS") {
      return prisma.pendaftaran.count({
         where: {
            periode_jalur_id: periodeJalurId,
            status_kelulusan: status
         }
      })
   }

   static async countAllSekolah(jenjang_sekolah_id: number) {
      return prisma.sekolah.count({
         where: { jenjang_sekolah_id: jenjang_sekolah_id }
      })
   }

   static async countAllSiswa() {
      return prisma.siswa.count()
   }

   static async countTotalPendaftarPerSekolah(periodeJalurId: number) {
      return prisma.pendaftaran.groupBy({
         by: ['sekolah_id'],
         take: 10,
         where: {
            periode_jalur_id: periodeJalurId
         },
         _count: {
            pendaftaran_id: true
         },
         orderBy: {
            _count: {
               pendaftaran_id: "desc"
            }
         }
      })
   }

}
