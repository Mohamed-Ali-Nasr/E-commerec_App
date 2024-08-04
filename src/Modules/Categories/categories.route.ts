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
  listAllCategories,
  updateCategory,
} from "./categories.controller";
// validation
import {
  createCategorySchema,
  deleteCategorySchema,
  getCategorySchema,
  PaginationSchema,
  updateCategorySchema,
} from "./categories.validation";

const categoryRouter = Router();

// routes
categoryRouter.post(
  "/create",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  validationMiddleware(createCategorySchema),
  getDocumentByName(CategoryModel),
  createCategory
);

categoryRouter.get("/", validationMiddleware(getCategorySchema), getCategory);

categoryRouter.put(
  "/update/:_id",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  validationMiddleware(updateCategorySchema),
  getDocumentByName(CategoryModel),
  updateCategory
);

categoryRouter.delete(
  "/delete/:_id",
  validationMiddleware(deleteCategorySchema),
  deleteCategory
);

categoryRouter.get(
  "/list",
  validationMiddleware(PaginationSchema),
  listAllCategories
);
export { categoryRouter };
