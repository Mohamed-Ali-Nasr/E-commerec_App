import { Router } from "express";
// middlewares
import {
  handleMulterError,
  multerHost,
  validationMiddleware,
} from "../../Middlewares";
// utils
import { extensions } from "../../Utils";
// controllers
import {
  addProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "./products.controller";
// validations
import {
  addProductSchema,
  deleteProductSchema,
  updateProductSchema,
} from "./products.validation";
import { PaginationSchema } from "../Categories/categories.validation";

const productRouter = Router();

// routes
productRouter.post(
  "/add",
  multerHost({ allowedExtensions: extensions.Images }).array("image", 5),
  handleMulterError,
  validationMiddleware(addProductSchema),
  addProduct
);

productRouter.put(
  "/update/:productId",
  multerHost({ allowedExtensions: extensions.Images }).array("image", 5),
  handleMulterError,
  validationMiddleware(updateProductSchema),
  updateProduct
);

productRouter.delete(
  "/delete/:productId",
  validationMiddleware(deleteProductSchema),
  deleteProduct
);

productRouter.get(
  "/list",
  validationMiddleware(PaginationSchema),
  listProducts
);

export { productRouter };
