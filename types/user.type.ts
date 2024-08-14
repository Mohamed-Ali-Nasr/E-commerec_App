import { Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  userType: "Buyer" | "Admin";
  age: string;
  gender: "Male" | "Female";
  phone: string;
  isEmailVerified: boolean;
  isMarkedAsDeleted: boolean;
  otp: string | null;
  otpExpires: Date | null;
}
