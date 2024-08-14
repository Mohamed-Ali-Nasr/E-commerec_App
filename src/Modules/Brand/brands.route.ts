import { Router } from "express";
// middlewares
import {
  authMiddleware,
  authorization,
  getDocumentByName,
  handleMulterError,
  multerHost,
  validationMiddleware,
} from "../../Middlewares";
// utils
import { extensions, roles } from "../../Utils";
// models
import { BrandModel } from "../../../DB/Models";
// controllers
import {
  createBrand,
  deleteBrand,
  getBrand,
  relevantBrands,
  updateBrand,
  listAllBrands,
} from "./brands.controller";
// validations
import {
  createBrandSchema,
  deleteBrandSchema,
  getBrandSchema,
  relevantBrandsSchema,
  updateBrandSchema,
} from "./brands.validation";

const brandRouter = Router();

// routes
brandRouter.post(
  "/create",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  handleMulterError,
  validationMiddleware(createBrandSchema),
  getDocumentByName(BrandModel),
  createBrand
);

brandRouter.get(
  "/",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  validationMiddleware(getBrandSchema),
  getBrand
);

brandRouter.put(
  "/update/:_id",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  handleMulterError,
  validationMiddleware(updateBrandSchema),
  getDocumentByName(BrandModel),
  updateBrand
);

brandRouter.delete(
  "/delete/:_id",
  authMiddleware,
  authorization(roles.ADMIN),
  validationMiddleware(deleteBrandSchema),
  deleteBrand
);

brandRouter.get(
  "/relevant",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  validationMiddleware(relevantBrandsSchema),
  relevantBrands
);

brandRouter.get("/list", listAllBrands);

export { brandRouter };
