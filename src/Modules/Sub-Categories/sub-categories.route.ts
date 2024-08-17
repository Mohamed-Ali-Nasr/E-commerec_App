import { Router } from "express";
// middlewares
import * as middleware from "../../Middlewares";
// utils
import { extensions, roles } from "../../Utils";
// models
import { SubCategoryModel } from "../../../DB/Models";
// controllers
import * as controller from "./sub-categories.controller";
// validations
import * as schema from "./sub-categories.validation";
import { Pagination } from "../Categories/categories.validation";

// destruct all used middleware
const {
  authMiddleware,
  authorization,
  handleMulterError,
  multerHost,
  validationMiddleware,
  getDocumentByName,
} = middleware;

const subCategoryRouter = Router();

// routes
subCategoryRouter.post(
  "/create",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  handleMulterError,
  validationMiddleware(schema.createSubCategory),
  getDocumentByName(SubCategoryModel),
  controller.createSubCategory
);

subCategoryRouter.get(
  "/",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  validationMiddleware(schema.getSubCategory),
  controller.getSubCategory
);

subCategoryRouter.put(
  "/update/:_id",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  handleMulterError,
  validationMiddleware(schema.updateSubCategory),
  getDocumentByName(SubCategoryModel),
  controller.updateSubCategory
);

subCategoryRouter.delete(
  "/delete/:_id",
  authMiddleware,
  authorization(roles.ADMIN),
  validationMiddleware(schema.deleteSubCategory),
  controller.deleteSubCategory
);

subCategoryRouter.get(
  "/list",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  validationMiddleware(Pagination),
  controller.listAllSubCategories
);

export { subCategoryRouter };
