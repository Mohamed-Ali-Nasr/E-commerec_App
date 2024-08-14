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
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  handleMulterError,
  validationMiddleware(createCategorySchema),
  getDocumentByName(CategoryModel),
  createCategory
);

categoryRouter.get(
  "/",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  validationMiddleware(getCategorySchema),
  getCategory
);

categoryRouter.put(
  "/update/:_id",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  handleMulterError,
  validationMiddleware(updateCategorySchema),
  getDocumentByName(CategoryModel),
  updateCategory
);

categoryRouter.delete(
  "/delete/:_id",
  authMiddleware,
  authorization(roles.ADMIN),
  validationMiddleware(deleteCategorySchema),
  deleteCategory
);

categoryRouter.get(
  "/list",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  validationMiddleware(PaginationSchema),
  listAllCategories
);
export { categoryRouter };
