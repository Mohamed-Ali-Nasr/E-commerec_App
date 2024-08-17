import { Router } from "express";
// middlewares
import * as middleware from "../../Middlewares";
// utils
import { extensions, roles } from "../../Utils";
// models
import { CategoryModel } from "../../../DB/Models";
// controllers
import * as controller from "./categories.controller";
// validation
import * as schema from "./categories.validation";

// destruct all used middleware
const {
  validationMiddleware,
  authMiddleware,
  authorization,
  getDocumentByName,
  handleMulterError,
  multerHost,
} = middleware;

const categoryRouter = Router();

// routes
categoryRouter.post(
  "/create",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  handleMulterError,
  validationMiddleware(schema.createCategory),
  getDocumentByName(CategoryModel),
  controller.createCategory
);

categoryRouter.get(
  "/",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  validationMiddleware(schema.getCategory),
  controller.getCategory
);

categoryRouter.put(
  "/update/:_id",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  handleMulterError,
  validationMiddleware(schema.updateCategory),
  getDocumentByName(CategoryModel),
  controller.updateCategory
);

categoryRouter.delete(
  "/delete/:_id",
  authMiddleware,
  authorization(roles.ADMIN),
  validationMiddleware(schema.deleteCategory),
  controller.deleteCategory
);

categoryRouter.get(
  "/list",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  validationMiddleware(schema.Pagination),
  controller.listAllCategories
);
export { categoryRouter };
