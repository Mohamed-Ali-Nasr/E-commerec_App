import { Document } from "mongoose";
import { IUser } from "./user.type";

export interface IAddress extends Document {
  _id: string;
  userId: string | IUser;
  country: string;
  city: string;
  postalCode: number;
  buildingNumber: number;
  floorNumber: number;
  addressLabel: string;
  isDefault: boolean;
  isMarkedAsDeleted: boolean;
}
