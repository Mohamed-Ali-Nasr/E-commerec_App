import mongoose from "../global-setup";
import { IUser } from "../../types";
import { env, gender, userRole } from "../../src/Utils";
import bcrypt from "bcryptjs";

const { Schema, model } = mongoose;

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    userType: { type: String, required: true, enum: Object.values(userRole) },

    age: { type: String, required: true },

    gender: { type: String, required: true, enum: Object.values(gender) },

    phone: { type: String, required: false },

    isEmailVerified: { type: Boolean, default: false },

    isMarkedAsDeleted: { type: Boolean, default: false },

    otp: { type: String },

    otpExpires: { type: Date },
  },
  { timestamps: true }
);

// apply document middleware on user model by hashing password before save in database
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(env.SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

export type IUserSchema = mongoose.Document & IUser;

export const UserModel =
  model<IUserSchema>("User", UserSchema) || mongoose.models.User;
