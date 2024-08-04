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
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  validationMiddleware(createSubCategorySchema),
  getDocumentByName(SubCategoryModel),
  createSubCategory
);

subCategoryRouter.get(
  "/",
  validationMiddleware(getSubCategorySchema),
  getSubCategory
);

subCategoryRouter.put(
  "/update/:_id",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  validationMiddleware(updateSubCategorySchema),
  getDocumentByName(SubCategoryModel),
  updateSubCategory
);

subCategoryRouter.delete(
  "/delete/:_id",
  validationMiddleware(deleteSubCategorySchema),
  deleteSubCategory
);

subCategoryRouter.get(
  "/list",
  validationMiddleware(PaginationSchema),
  listAllSubCategories
);

export { subCategoryRouter };
