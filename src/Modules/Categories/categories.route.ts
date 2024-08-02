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
import { CategoryModel } from "../../../DB/Models";
// controllers
import {
  createCategory,
  deleteCategory,
  getCategory,
  updateCategory,
} from "./categories.controller";
// validation
import {
  createCategorySchema,
  deletedCategorySchema,
  getCategorySchema,
  updateCategorySchema,
} from "./categories.validation";

const categoryRouter = Router();

// routes
categoryRouter.post(
  "/create",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(CategoryModel),
  validationMiddleware(createCategorySchema),
  createCategory
);

categoryRouter.get("/", validationMiddleware(getCategorySchema), getCategory);

categoryRouter.put(
  "/update/:_id",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(CategoryModel),
  validationMiddleware(updateCategorySchema),
  updateCategory
);

categoryRouter.delete(
  "/delete/:_id",
  validationMiddleware(deletedCategorySchema),
  deleteCategory
);

export { categoryRouter };
