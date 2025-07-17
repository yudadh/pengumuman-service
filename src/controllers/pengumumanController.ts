import { Request, Response, NextFunction } from "express";
import { PengumumanService } from "../services/pengumumanService";
import { logger } from "../utils/logger";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/successResponse";
import {
   PaginationMeta,
   rankingMethod,
} from "../interfaces/pengumumanInterface";
import { StatusKelulusan } from "@prisma/client";

export async function setKelulusan(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { sekolah_id, periode_jalur_id }: {
         sekolah_id: number, 
         periode_jalur_id: number
      } = req.body
      const response = await PengumumanService.updateStatusKelulusan(sekolah_id, periode_jalur_id)
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in updateStatusKelulusan]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in updateStatusKelulusan]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in updateStatusKelulusan]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getPengumumanData(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params
      const periode_jalur_id = Number(req.query.periode_jalur_id ?? 0)
      const page = Number(req.query.page ?? 1)
      const limit = Number(req.query.limit ?? 10)
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {}
      const response = await PengumumanService.getPengumumanData(
         Number(id as string),
         periode_jalur_id,
         page,
         limit, 
         filters
      )
      const meta: PaginationMeta = {
         page: page,
         limit: limit,
         total: response.total
      }
      successResponse(res, 200, response.response, meta);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getPengumumanData]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getPengumumanData]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getPengumumanData]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getTotalPendaftaranBySekolah(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const periode_id = Number(req.query.periode_id ?? 0)
      const periode_jalur_id = Number(req.query.periode_jalur_id ?? 0)
      const page = Number(req.query.page ?? 1)
      const limit = Number(req.query.limit ?? 10)
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {}
      const response = await PengumumanService.getTotalPendaftaranBySekolah(
         periode_id,
         periode_jalur_id,
         page,
         limit,
         filters
      )
      const meta: PaginationMeta = {
         page: page,
         limit: limit,
         total: response.total
      }
      successResponse(res, 200, response.response, meta);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getTotalPendaftaranBySekolah]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getTotalPendaftaranBySekolah]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getTotalPendaftaranBySekolah]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getLaporanPendaftaranByStream(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const periode_id = Number(req.query.periode_id ?? null)
      const periode_jalur_id = Number(req.query.periode_jalur_id ?? 0)
      const sekolah_id = Number(req.query.sekolah_id ?? null)
      const status = req.query.status_kelulusan as StatusKelulusan ?? null
     
      await PengumumanService.getLaporanPendaftaranByStream(res, periode_id, periode_jalur_id, sekolah_id, status)
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getLaporanPendaftaranByStream]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getLaporanPendaftaranByStream]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getLaporanPendaftaranByStream]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getLaporanDashboardSD(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params
      const { periode_jalur_id } = req.query
      const response = await PengumumanService.getLaporanDashboardSD(
         Number(id as string),
         Number(periode_jalur_id as string)
      )
      
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getLaporanDashboardSD]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getLaporanDashboardSD]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getLaporanDashboardSD]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getLaporanDashboardSMP(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params
      const { periode_jalur_id } = req.query
      const response = await PengumumanService.getLaporanDashboardSMP(
         Number(id as string),
         Number(periode_jalur_id as string)
      )
      
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getLaporanDashboardSMP]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getLaporanDashboardSMP]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getLaporanDashboardSMP]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getLaporanDashboardDinas(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params
      const response = await PengumumanService.getLaporanDashboardDinas(
         Number(id as string)
      )
      
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getLaporanDashboardDinas]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getLaporanDashboardDinas]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getLaporanDashboardDinas]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getTotalPendaftarPerSekolah(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params
      const response = await PengumumanService.getTotalPendaftarPerSekolah(
         Number(id as string)
      )
      
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getTotalPendaftarPerSekolah]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getTotalPendaftarPerSekolah]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getTotalPendaftarPerSekolah]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getAllPendaftaranZonasi(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params
      const { page = 1, limit = 10 } = req.query
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {}
      const response = await PengumumanService.getAllPendaftaranZonasi(
         Number(id as string),
         Number(page as string),
         Number(limit as string),
         filters
      )
      const meta: PaginationMeta = {
         page: Number(page as string),
         limit: Number(limit as string),
         total: response.total
      }
      successResponse(res, 200, response.response, meta);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in getAllPendaftaranZonasi]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getAllPendaftaranZonasi]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getAllPendaftaranZonasi]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

