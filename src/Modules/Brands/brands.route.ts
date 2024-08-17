import { Router } from "express";
// middlewares
import * as middleware from "../../Middlewares";
// utils
import { extensions, roles } from "../../Utils";
// models
import { BrandModel } from "../../../DB/Models";
// controllers
import * as controller from "./brands.controller";
// validations
import * as schema from "./brands.validation";

// destruct all used middleware
const {
  validationMiddleware,
  authMiddleware,
  authorization,
  getDocumentByName,
  handleMulterError,
  multerHost,
} = middleware;

const brandRouter = Router();

// routes
brandRouter.post(
  "/create",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  handleMulterError,
  validationMiddleware(schema.createBrand),
  getDocumentByName(BrandModel),
  controller.createBrand
);

brandRouter.get(
  "/",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  validationMiddleware(schema.getBrand),
  controller.getBrand
);

brandRouter.put(
  "/update/:_id",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  handleMulterError,
  validationMiddleware(schema.updateBrand),
  getDocumentByName(BrandModel),
  controller.updateBrand
);

brandRouter.delete(
  "/delete/:_id",
  authMiddleware,
  authorization(roles.ADMIN),
  validationMiddleware(schema.deleteBrand),
  controller.deleteBrand
);

brandRouter.get(
  "/relevant",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  validationMiddleware(schema.relevantBrands),
  controller.relevantBrands
);

brandRouter.get("/list", controller.listAllBrands);

export { brandRouter };
