import jwt from "jsonwebtoken";
import { env } from "../../Utils";
import { UserModel } from "../../../DB/Models";

export const isAuthQl = async (token: string, allowedRoles: string[]) => {
  try {
    if (!token) {
      return new Error("please login first", { cause: 401 });
    }

    if (!token.startsWith("Bearer ")) {
      return new Error("invalid token", { cause: 400 });
    }

    const originToken = token.split(" ")[1];

    const data = jwt.verify(originToken, env.JWT_SIGNIN);

    const isUserExist = await UserModel.findById((data as any).id);

    if (!isUserExist) {
      return new Error("user not found", { cause: 404 });
    }

    if (!allowedRoles.includes(isUserExist.userType)) {
      return new Error(
        "Authorization Error, You Are Not Allowed To Access This Route",
        { cause: 403 }
      );
    }

    return {
      code: 200,
      isUserExist,
    };
  } catch (error) {
    console.log(error);
    new Error("catch error in authentication", { cause: 500 });
  }
};
