import { Router } from "express";
// middlewares
import {
  authMiddleware,
  authorization,
  handleMulterError,
  multerHost,
  validationMiddleware,
} from "../../Middlewares";
// utils
import { extensions, roles } from "../../Utils";
// controllers
import {
  addProduct,
  apiFeaturesProducts,
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

const productRouter = Router();

// routes
productRouter.post(
  "/add",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).array("image", 5),
  handleMulterError,
  validationMiddleware(addProductSchema),
  addProduct
);

productRouter.put(
  "/update/:productId",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).array("image", 5),
  handleMulterError,
  validationMiddleware(updateProductSchema),
  updateProduct
);

productRouter.delete(
  "/delete/:productId",
  authMiddleware,
  authorization(roles.ADMIN),
  validationMiddleware(deleteProductSchema),
  deleteProduct
);

productRouter.get(
  "/list",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  listProducts
);

productRouter.get(
  "/api-features",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  apiFeaturesProducts
);

export { productRouter };
