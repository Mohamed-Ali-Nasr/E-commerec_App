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
import { SubCategoryModel } from "../../../DB/Models";
// controllers
import {
  createSubCategory,
  deleteSubCategory,
  getSubCategory,
  listAllSubCategories,
  updateSubCategory,
} from "./sub-categories.controller";
// validations
import {
  createSubCategorySchema,
  deleteSubCategorySchema,
  getSubCategorySchema,
  updateSubCategorySchema,
} from "./sub-categories.validation";
import { PaginationSchema } from "../Categories/categories.validation";

const subCategoryRouter = Router();

// routes
subCategoryRouter.post(
  "/create",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  handleMulterError,
  validationMiddleware(createSubCategorySchema),
  getDocumentByName(SubCategoryModel),
  createSubCategory
);

subCategoryRouter.get(
  "/",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  validationMiddleware(getSubCategorySchema),
  getSubCategory
);

subCategoryRouter.put(
  "/update/:_id",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  handleMulterError,
  validationMiddleware(updateSubCategorySchema),
  getDocumentByName(SubCategoryModel),
  updateSubCategory
);

subCategoryRouter.delete(
  "/delete/:_id",
  authMiddleware,
  authorization(roles.ADMIN),
  validationMiddleware(deleteSubCategorySchema),
  deleteSubCategory
);

subCategoryRouter.get(
  "/list",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  validationMiddleware(PaginationSchema),
  listAllSubCategories
);

export { subCategoryRouter };
