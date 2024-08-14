import { Document, ObjectId } from "mongoose";
import { IUserSchema } from "../DB/Models";
import { Request } from "express";

export interface IUserToken extends Document {
  _id: string;
  userId: ObjectId;
  token: string;
}

export interface IRequest extends Request {
  userId?: string;
  authUser?: IUserSchema;
}
