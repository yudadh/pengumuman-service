import { z } from "zod";

const page = z.string().regex(/^\d+$/, "ID must be a numeric string")
const limit = z.string().regex(/^\d+$/, "ID must be a numeric string")

const filterSchema = z.object({
   value: z.string().or(z.boolean()).or(z.number()).nullable(),
   matchMode: z.string()
})

const filters = z
   .string()
   .optional()
   .transform((str) => {
     try {
       const val = str ? JSON.parse(str) : {}
       console.log(val)
       return val;
     } catch (e) {
       return null; // Jika gagal parse, return null agar validasi gagal nanti
     }
   })
   .refine(
     (data) => data !== null && typeof data === "object" && !Array.isArray(data),
     {
       message: "filters harus berupa objek JSON yang valid",
     }
   )
   .pipe(z.record(filterSchema))

const periode_jalur_id =  z.string().regex(/^\d+$/, "ID must be a numeric string")

export const paginationSchema = z.object({
   page,
   limit,
});

export const paramsSchema = z.object({
   id: z.string().regex(/^\d+$/, "ID must be a numeric string")
});

export const setKelulusanBodySchema = z.object({
   sekolah_id: z.number().int().positive(),
   periode_jalur_id: z.number().int().positive()
})

export const kuotaPendaftarQuerySchema = z.object({
   periode_id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
   periode_jalur_id,
   page,
   limit,
   filters
})

export const pengumumanQuerySchema = z.object({
  periode_jalur_id,
  page,
  limit,
  filters
})

export const getLaporanPendaftaran = z.object({
  periode_id: z.string().regex(/^\d+$/, "ID must be a numeric string").optional(),
  periode_jalur_id: z.string().regex(/^\d+$/, "ID must be a numeric string").optional(),
  sekolah_id: z.nullable(z.string().regex(/^\d+$/, "ID must be a numeric string")),
  status_kelulusan: z.optional(z.enum(["PENDAFTARAN", "LULUS", "TIDAK_LULUS"]))
})

export const getLaporanDashboardQuerySchema = z.object({
  periode_jalur_id
})

export const getAllPendaftaranZonasiQuery = z.object({
  page,
  limit,
  filters
})