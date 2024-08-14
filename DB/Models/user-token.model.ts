import mongoose, { Schema, model } from "mongoose";
import { IUserToken } from "../../types";

const UserTokenSchema = new Schema<IUserToken>({
  userId: { type: Schema.Types.ObjectId, required: true },

  token: { type: String, required: true },
});

export type IUserTokenSchema = mongoose.Document & IUserToken;

export const UserTokenModel =
  model<IUserTokenSchema>("UserToken", UserTokenSchema) ||
  mongoose.models.UserToken;
