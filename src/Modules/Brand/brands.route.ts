import { Router } from "express";
// middlewares
import {
  getDocumentByName,
  multerHost,
  validationMiddleware,
} from "../../Middlewares";
// utils
import { extensions } from "../../Utils";
// models
import { BrandModel } from "../../../DB/Models";
// controllers
import {
  createBrand,
  deleteBrand,
  getBrand,
  relevantBrands,
  updateBrand,
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
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  validationMiddleware(createBrandSchema),
  getDocumentByName(BrandModel),
  createBrand
);

brandRouter.get("/", validationMiddleware(getBrandSchema), getBrand);

brandRouter.put(
  "/update/:_id",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  validationMiddleware(updateBrandSchema),
  getDocumentByName(BrandModel),
  updateBrand
);

brandRouter.delete(
  "/delete/:_id",
  validationMiddleware(deleteBrandSchema),
  deleteBrand
);

brandRouter.get(
  "/relevant",
  validationMiddleware(relevantBrandsSchema),
  relevantBrands
);

export { brandRouter };
