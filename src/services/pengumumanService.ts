import { PengumumanRepository } from "../repositories/pengumumanRepository";
import { MetodeRanking, Prisma, StatusKelulusan } from "@prisma/client";
import { AppError } from "../utils/appError";
import { GetKelulusanSiswa, GetLaporanDashboardDinas, GetLaporanDashboardSd, GetLaporanDashboardSmp, GetLaporanPendaftaran, GetTotalPendaftaranBySekolah, GetTotalPendaftarPerSekolah, orderByParam, PendaftaranZonasiResponse } from "../interfaces/pengumumanInterface";
import { logger } from "../utils/logger";
import { GetBatchResult } from "@prisma/client/runtime/library";
import ExcelJS from "exceljs";
import { Response } from "express";

export class PengumumanService {
   static async updateStatusKelulusan(sekolahId: number, periode_jalur_id: number): Promise<GetBatchResult> {
      const sekolahKuota = await PengumumanRepository.findZonasiKuota(sekolahId, 'kuota_zonasi')
      const periodeJalur = await PengumumanRepository.findPeriodeJalur(periode_jalur_id)

      if (!sekolahKuota) {
         logger.warn(`sekolah not found for sekolah with id ${sekolahId}`)
         throw new AppError(`sekolah not found for sekolah with id ${sekolahId}`, 404)
      }

      if (!sekolahKuota.kuota) {
         logger.warn(`kuota zonasi not found for sekolah with id ${sekolahId}`)
         throw new AppError(`kuota zonasi not found for sekolah with id ${sekolahId}`, 404)
      }

      if (!periodeJalur) {
         throw new AppError("Periode jalur tidak ditemukan", 404)
      }

      const jalurNama = periodeJalur.jalur.jalur_nama.toLowerCase()
      let pendaftaranIdsRes: { pendaftaran_id: number }[] = []
      if (jalurNama === "zonasi") {
         const metodeRanking = periodeJalur.metode_ranking ? periodeJalur.metode_ranking.toLowerCase() : null

         if (!metodeRanking) {
            throw new AppError("Periode jalur zonasi tidak memiliki metode ranking", 404)
         }

         const whereClause: Prisma.PendaftaranWhereInput = {
            sekolah_id: sekolahId,
            periode_jalur_id: periode_jalur_id,
            status: "VERIF_SMP"
         }

         const orderByParam = this.sortOrderByKelulusan(metodeRanking)
         const orderBy = orderByParam.map((v) => ({
            [v.field]: v.direction
         }))
         const pendaftaranIds = await PengumumanRepository.findPendaftaranLulus(
            sekolahKuota.kuota,
            0,
            whereClause,
            orderBy,
            { pendaftaran_id: true }
         )
         pendaftaranIdsRes = pendaftaranIds
      }
      
      const pendaftaranIds: number[] = pendaftaranIdsRes.map((pendaftaran) => pendaftaran.pendaftaran_id)
      await PengumumanRepository.updateTidakLulus(sekolahId, pendaftaranIds, periode_jalur_id)
      return await PengumumanRepository.updateStatusKelulusan(pendaftaranIds)
   }

   private static sortOrderByKelulusan(metodeRanking: string) {
      let orderBy: orderByParam[] = [] 
      
      if (metodeRanking === 'jarak_lurus') {
         orderBy.push({ field: 'jarak_lurus', direction: 'asc' })
      }

      if (metodeRanking === 'jarak_rute') {
         orderBy.push({ field: 'jarak_rute', direction: 'asc' })
      }

      orderBy.push({ field: 'umur_siswa', direction: 'desc' })

      return orderBy
   }

   static async getPengumumanData(
      sekolahId: number, 
      periode_jalur_id: number,
      page: number,
      limit: number,
      filters: any
   ): Promise<{
    response: GetKelulusanSiswa[];
    total: number;
   }> {
      const periodeJalur = await PengumumanRepository.findPeriodeJalur(periode_jalur_id)

      if (!periodeJalur) {
         throw new AppError("Periode jalur tidak ditemukan", 404)
      }

      // if (periodeJalur.jalur.jalur_nama.toLowerCase() === 'zonasi' && !periodeJalur.metode_ranking) {
      //    throw new AppError("Periode jalur zonasi tidak memiliki metode ranking", 404)
      // }
      let response: GetKelulusanSiswa[] = []
      let total: number = 0
      if (periodeJalur.jalur.jalur_nama.toLowerCase() === 'zonasi') {
         const metodeRanking = periodeJalur.metode_ranking ? periodeJalur.metode_ranking.toLowerCase() : null

         if (!metodeRanking) {
            throw new AppError("Periode jalur zonasi tidak memiliki metode ranking", 404)
         }

         const orderBy = this.sortOrderByKelulusan(metodeRanking)
         const skip = (page - 1) * limit
         let whereClause: any = {
            sekolah_id: sekolahId,
            periode_jalur_id: periode_jalur_id,
            status: "VERIF_SMP",
         }
         
         if (filters.statusKelulusan?.value) {
            whereClause.status_kelulusan = filters.statusKelulusan.value
         }
   
         const orderByParam = orderBy.map((i) => ({
            [i.field]: i.direction
         }))
   
         const data = await PengumumanRepository.findPendaftaranLulus(
            limit, 
            skip,
            whereClause,
            orderByParam, 
            {
               pendaftaran_id: true,
               siswa_id: true,
               siswa: {
                  select: {
                     nama: true,
                     nisn: true,
                     sekolah_asal_id: true,
                     sekolah_asal: {
                        select: {
                           sekolah_nama: true
                        }
                     }
                  }
               },
               status_kelulusan: true
            } 
         )

         response = data.map((d) => ({
            pendaftaran_id: d.pendaftaran_id,
            siswa_id: d.siswa_id,
            nama: d.siswa.nama,
            nisn: d.siswa.nisn,
            sekolah_asal_id: d.siswa.sekolah_asal_id ? d.siswa.sekolah_asal_id : 0,
            sekolah_asal_nama: d.siswa.sekolah_asal ? d.siswa.sekolah_asal.sekolah_nama : "",
            status_kelulusan: d.status_kelulusan
         }))
         total = await PengumumanRepository.countPendaftaranSiswa(whereClause)
      }

      return {
         response,
         total
      }
   }

   static async getLaporanPendaftaranByStream(
      res: Response,
      periode_id: number | null,
      periodeJalurId: number | null, 
      sekolahId: number | null, 
      status: StatusKelulusan | null
   ) {
      const whereClause: Prisma.PendaftaranWhereInput = {}

      if (periode_id) {
         const periodeJalurs = await PengumumanRepository.findPeriodeJalurByPeriodeId(periode_id)
         const periodeJalurZonasi = periodeJalurs.find((pj) => pj.jalur.jalur_nama.toLowerCase() === "zonasi")
         if (periodeJalurZonasi) {
            whereClause.periode_jalur_id = periodeJalurZonasi.periode_jalur_id
         }
      }

      if (periodeJalurId) {
         whereClause.periode_jalur_id = periodeJalurId
      }

      if (sekolahId) {
         console.log("sekolah_id ditambahkan")
         whereClause.sekolah_id = sekolahId
      }

      if (status) {
         whereClause.status_kelulusan = status
      }

      const pendaftarans = await PengumumanRepository.findAllLaporanPendaftaran(whereClause)

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', 'attachment; filename=laporan-pendaftaran.xlsx')

      const pendaftaranData: GetLaporanPendaftaran[] = pendaftarans.map((p) => ({
         nama: p.siswa.nama,
         nik: p.siswa.nik ?? "",
         nisn: p.siswa.nisn,
         alamat_tinggal: p.siswa.alamat_tinggal,
         alamat_kk: p.siswa.alamat_kk ?? "",
         tanggal_lahir: p.siswa.tanggal_lahir,
         nomor_telepon: p.siswa.nomor_telepon ?? "",
         jenis_kelamin: p.siswa.jenis_kelamin,
         agama: p.siswa.m_agama ? p.siswa.m_agama.nama_agama : "",
         sekolah_asal: p.siswa.sekolah_asal ? p.siswa.sekolah_asal.sekolah_nama : "",
         sekolah_tujuan: p.sekolah_tujuan.sekolah_nama,
         desa: p.siswa.desa ? p.siswa.desa.desa_nama : "",
         banjar: p.siswa.banjar ? p.siswa.banjar.banjar_nama : "",
         status_kelulusan: p.status_kelulusan,
         umur_siswa: p.umur_siswa,
         jarak_lurus: p.jarak_lurus,
         jarak_rute: p.jarak_rute
      }))

      const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res })
      const worksheet = workbook.addWorksheet("Hasil Kelulusan Siswa")
      worksheet.addRow(
         [
            "No",
            "Nama", 
            "NIK", 
            "NISN", 
            "Alamat Tinggal", 
            "Alamat KK", 
            "Tanggal Lahir", 
            "Nomor Telepon", 
            "Jenis Kelamin", 
            "Agama",
            "Sekolah Asal",
            "Sekolah Tujuan",
            "Desa",
            "Banjar",
            "Umur Siswa",
            "Jarak Lurus (m)",
            "Jarak Rute (m)",
            "Status Kelulusan"
         ]
      ).commit()

      for (const [i, pd] of pendaftaranData.entries()) {
         worksheet.addRow([
            i + 1,
            pd.nama,
            pd.nik,
            pd.nisn,
            pd.alamat_tinggal,
            pd.alamat_kk,
            pd.tanggal_lahir,
            pd.nomor_telepon,
            pd.jenis_kelamin,
            pd.agama,
            pd.sekolah_asal,
            pd.sekolah_tujuan,
            pd.desa,
            pd.banjar,
            pd.umur_siswa,
            pd.jarak_lurus,
            pd.jarak_rute,
            pd.status_kelulusan
         ]).commit()
      }

      await workbook.commit()
   }

   static async getTotalPendaftaranBySekolah(
      periodeId: number,
      periodeJalurId: number, 
      page: number, 
      limit: number,
      filters: any
   ): Promise<{
    response: GetTotalPendaftaranBySekolah[];
    total: number;
   }> {
      const skip = (page - 1) * limit

      let whereClause: any = {
         jenjang_sekolah_id: 1
      }

      if (filters.sekolah_id?.value) {
         whereClause.sekolah_id = filters.sekolah_id.value
      }

      if (filters.npsn?.value) {
         whereClause.npsn = {
            contains: filters.npsn.value
         }
      }

      const sekolah = await PengumumanRepository.findAllSekolahSMP(skip, limit, whereClause)
      const sekolahIds = sekolah.map((sk) => sk.sekolah_id)
      const sekolahCount = await PengumumanRepository.countAllSekolahSMP(whereClause)
      const [pendaftaranGroupCount, kuotaSekolah] = await Promise.all([
         PengumumanRepository.findAllPendaftaranZonasiSekolahCount(periodeJalurId, sekolahIds),
         PengumumanRepository.findAllKuotaSekolah(periodeId, sekolahIds)
      ])
      // console.log(pendaftaranGroupCount)
      const pendaftaranMap = new Map<number, number>()
      for (const p of pendaftaranGroupCount) {
         pendaftaranMap.set(p.sekolah_id, p._count.pendaftaran_id)
      }

      const kuotaSekolahMap = new Map<number, number>()
      for (const ks of kuotaSekolah) {
         kuotaSekolahMap.set(ks.sekolah_id, ks.kuota)
      }

      const response: GetTotalPendaftaranBySekolah[] = sekolah.map((sk) => ({
         sekolah_id: sk.sekolah_id,
         sekolah_nama: sk.sekolah_nama,
         npsn: sk.npsn ?? "",
         totalPendaftar: pendaftaranMap.get(sk.sekolah_id) ?? 0,
         kuota: kuotaSekolahMap.get(sk.sekolah_id) ?? 0
      }))

      return { response, total: sekolahCount}
   }

   static async getLaporanDashboardSD(
      sekolahId: number, 
      periodeJalurId: number
   ): Promise<GetLaporanDashboardSd> {

      const [ 
         totalUser, 
         totalSiswa, 
         totalSiswaTerdaftar,
         totalSiswaLulus,
         totalSiswaTerverifikasi,
         totalSiswaBelumTerverifikasi,
         totalBiodataBelumLengkap,
         totalDokumenBelumLengkap
      ] = await Promise.all([
         PengumumanRepository.countUserSiswaBySekolahId(sekolahId),
         PengumumanRepository.countSiswaBySekolahId(sekolahId),
         PengumumanRepository.countSiswaTerdaftar(sekolahId, periodeJalurId),
         PengumumanRepository.countSiswaLulus(sekolahId, periodeJalurId),
         PengumumanRepository.countSiswaVerifikasi(sekolahId, periodeJalurId, "VERIF_SMP"),
         PengumumanRepository.countSiswaVerifikasi(sekolahId, periodeJalurId, "VERIF_SD"),
         PengumumanRepository.countBiodataSiswaBelumLengkap(sekolahId),
         PengumumanRepository.countDokumenSiswaBelumLengkap(sekolahId)
      ])
      
      // console.log(Number(totalBiodataBelumLengkap[0].count))
      // console.log(Number(totalDokumenBelumLengkap[0].count))

      return {
         total_siswa: totalSiswa,
         total_user: totalUser,
         total_terdaftar: totalSiswaTerdaftar,
         total_lulus: totalSiswaLulus,
         total_terverifikasi: totalSiswaTerverifikasi,
         total_belum_terverifikasi: totalSiswaBelumTerverifikasi,
         total_biodata_belum_lengkap: Number(totalBiodataBelumLengkap[0].count),
         total_dokumen_belum_lengkap: Number(totalDokumenBelumLengkap[0].count)
      }

   }

   static async getLaporanDashboardSMP(
      sekolahId: number, 
      periodeJalurId: number
   ): Promise<GetLaporanDashboardSmp> {
      const [
         totalSiswaTerdaftar,
         totalSiswaTerverifikasi,
         totalSiswaBelumTerverifikasi,
         totalSiswaLulus
      ] = await Promise.all([
         PengumumanRepository.countTotalSiswaTerdaftar(sekolahId, periodeJalurId),
         PengumumanRepository.countSiswaVerifikasiSmp(sekolahId, periodeJalurId, "VERIF_SMP"),
         PengumumanRepository.countSiswaVerifikasiSmp(sekolahId, periodeJalurId, "VERIF_SD"),
         PengumumanRepository.countSiswaLulusSmp(sekolahId, periodeJalurId)
      ])

      return {
         total_siswa_terdaftar: totalSiswaTerdaftar,
         total_terverifikasi: totalSiswaTerverifikasi,
         total_belum_terverifikasi: totalSiswaBelumTerverifikasi,
         total_lulus: totalSiswaLulus
      }
   }

   static async getLaporanDashboardDinas(periodeJalurId: number): Promise<GetLaporanDashboardDinas> {
      const [
         totalSiswa,
         totalSekolahSd,
         totalSekolahSmp,
         totalSiswaTerdaftar,
         totalSiswaTerverifikasi,
         totalSiswaBelumTerverifikasi,
         totalSiswaLulus,
         totalSiswaTidakLulus
      ] = await Promise.all([
         PengumumanRepository.countAllSiswa(),
         PengumumanRepository.countAllSekolah(2),
         PengumumanRepository.countAllSekolah(1),
         PengumumanRepository.countAllSiswaTerdaftar(periodeJalurId),
         PengumumanRepository.countAllSiswaVerifikasi(periodeJalurId, "VERIF_SMP"),
         PengumumanRepository.countAllSiswaVerifikasi(periodeJalurId, "VERIF_SD"),
         PengumumanRepository.countAllSiswaLulus(periodeJalurId, "LULUS"),
         PengumumanRepository.countAllSiswaLulus(periodeJalurId, "TIDAK_LULUS"),
      ])

      return {
         total_siswa: totalSiswa,
         total_sekolah_sd: totalSekolahSd,
         total_sekolah_smp: totalSekolahSmp,
         total_terdaftar: totalSiswaTerdaftar,
         total_terverifikasi: totalSiswaTerverifikasi,
         total_belum_terverifikasi: totalSiswaBelumTerverifikasi,
         total_lulus: totalSiswaLulus,
         total_tidak_lulus: totalSiswaTidakLulus
      }
   }

   static async getTotalPendaftarPerSekolah(periodeJalurId: number): Promise<GetTotalPendaftarPerSekolah[]> {
      const data = await PengumumanRepository.countTotalPendaftarPerSekolah(periodeJalurId)
      const sekolahs = await PengumumanRepository.findAllSekolahSMP(0, 100, { jenjang_sekolah_id: 1 })
      const sekolahMap = new Map<number, string>()

      for (const sekolah of sekolahs) {
         sekolahMap.set(sekolah.sekolah_id, sekolah.sekolah_nama)
      }

      const response: GetTotalPendaftarPerSekolah[] = data.map((d) => ({
         sekolah_id: d.sekolah_id,
         sekolah_nama: sekolahMap.get(d.sekolah_id) ?? "",
         total_pendaftar: d._count.pendaftaran_id
      }))

      return response
   }

   static async getAllPendaftaranZonasi(periode_id: number, page: number, limit: number, filters: any): Promise<{
    response: PendaftaranZonasiResponse[];
    total: number;
}> {
      const skip = (page - 1) * limit
      const periodeJalurs = await PengumumanRepository.findPeriodeJalurByPeriodeId(periode_id)
      const periodeJalurId = periodeJalurs.find((pj) => pj.jalur.jalur_nama.toLowerCase() === "zonasi")
      if (!periodeJalurId) {
         throw new AppError("Periode jalur zonasi tidak ditemukan", 404)
      }
      const whereClause: Prisma.PendaftaranWhereInput = {
         periode_jalur_id: periodeJalurId.periode_jalur_id
      }

      if (filters.sekolah_id?.value) {
         whereClause.sekolah_id = filters.sekolah_id.value
      }

      const pendaftarans = await PengumumanRepository.findAllPendaftaranZonasi(whereClause, skip, limit)
      const total = await PengumumanRepository.countAllPendaftaranZonasi(whereClause)

      const response: PendaftaranZonasiResponse[] = pendaftarans.map((p) => ({
         pendaftaran_id: p.pendaftaran_id,
         sekolah_id: p.sekolah_id,
         sekolah_nama: p.sekolah_tujuan.sekolah_nama,
         siswa_id: p.siswa_id,
         siswa_nama: p.siswa.nama,
         nisn: p.siswa.nisn,
         sekolah_asal_nama: p.siswa.sekolah_asal ? p.siswa.sekolah_asal.sekolah_nama : "",
         jarak_lurus: p.jarak_lurus,
         jarak_rute: p.jarak_rute,
         status: p.status,
         status_kelulusan: p.status_kelulusan
      }))

      return { response, total }
   }
   
}