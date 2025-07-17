import express from "express";
import { authMiddleware } from "../middleware/jwtAuth";
import { roleMiddleware } from "../middleware/verifyRole";
import { validateRequest } from "../middleware/validation";
import {
   getAllPendaftaranZonasiQuery,
   getLaporanDashboardQuerySchema,
   getLaporanPendaftaran,
   kuotaPendaftarQuerySchema,
   paramsSchema,
   pengumumanQuerySchema,
   setKelulusanBodySchema
} from "../validation/pengumumanSchema";
import * as PengumumanController from "../controllers/pengumumanController";
import { verifyPeriode } from "../middleware/verifyPeriode";

const router = express.Router();

router.post("/set-kelulusan",
   authMiddleware,
   roleMiddleware(["adminSMP", "adminDisdik"]),
   verifyPeriode,
   validateRequest({ body: setKelulusanBodySchema }),
   PengumumanController.setKelulusan
)

router.get(
   "/zonasi/:id",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({ params: paramsSchema, query: getAllPendaftaranZonasiQuery }),
   PengumumanController.getAllPendaftaranZonasi
)

router.get("/kelulusan/:id",
   authMiddleware,
   roleMiddleware(["adminSMP", "adminDisdik"]),
   validateRequest({ params: paramsSchema, query: pengumumanQuerySchema }),
   PengumumanController.getPengumumanData
)

router.get("/kuota-pendaftar",
   authMiddleware,
   roleMiddleware(["siswa", "adminDisdik"]),
   validateRequest({ query: kuotaPendaftarQuerySchema }),
   PengumumanController.getTotalPendaftaranBySekolah
)

router.get("/laporan-pendaftaran",
   authMiddleware,
   roleMiddleware(["adminSMP", "adminDisdik"]),
   validateRequest({ query: getLaporanPendaftaran }),
   PengumumanController.getLaporanPendaftaranByStream
)

router.get("/dashboard-sd/:id",
   authMiddleware,
   roleMiddleware(["adminSD", "adminDisdik"]),
   validateRequest({ params: paramsSchema, query: getLaporanDashboardQuerySchema }),
   PengumumanController.getLaporanDashboardSD
)

router.get("/dashboard-smp/:id",
   authMiddleware,
   roleMiddleware(["adminSMP", "adminDisdik"]),
   validateRequest({ params: paramsSchema, query: getLaporanDashboardQuerySchema }),
   PengumumanController.getLaporanDashboardSMP
)

router.get("/dashboard-dinas/:id",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({ params: paramsSchema }),
   PengumumanController.getLaporanDashboardDinas
)

router.get("/pendaftar-per-sekolah/:id",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({ params: paramsSchema }),
   PengumumanController.getTotalPendaftarPerSekolah
)

export default router;
