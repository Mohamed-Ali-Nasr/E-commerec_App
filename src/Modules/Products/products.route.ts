import { Router } from "express";
// middlewares
import * as middleware from "../../Middlewares";
// utils
import { extensions, roles } from "../../Utils";
// controllers
import * as controller from "./products.controller";
// validations
import * as schema from "./products.validation";

// destruct all used middleware
const {
  authMiddleware,
  authorization,
  handleMulterError,
  multerHost,
  validationMiddleware,
} = middleware;

const productRouter = Router();

// routes
productRouter.post(
  "/add",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).array("image", 5),
  handleMulterError,
  validationMiddleware(schema.addProduct),
  controller.addProduct
);

productRouter.put(
  "/update/:productId",
  authMiddleware,
  authorization(roles.ADMIN),
  multerHost({ allowedExtensions: extensions.Images }).array("image", 5),
  handleMulterError,
  validationMiddleware(schema.updateProduct),
  controller.updateProduct
);

productRouter.delete(
  "/delete/:productId",
  authMiddleware,
  authorization(roles.ADMIN),
  validationMiddleware(schema.deleteProduct),
  controller.deleteProduct
);

productRouter.get(
  "/list",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  controller.listProducts
);

productRouter.get(
  "/api-features",
  authMiddleware,
  authorization(roles.BUYER_ADMIN),
  controller.apiFeaturesProducts
);

export { productRouter };
