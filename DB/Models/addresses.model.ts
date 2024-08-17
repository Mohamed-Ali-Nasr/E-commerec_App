import mongoose, { Schema, model } from "mongoose";
import { IAdresses } from "../../types";

const AddressSchema = new Schema<IAdresses>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    country: { type: String, required: true },

    city: { type: String, required: true },

    postalCode: { type: Number, required: true },

    buildingNumber: { type: Number, required: true },

    floorNumber: { type: Number, required: true },

    addressLabel: { type: String },

    isDefault: { type: Boolean, default: false },

    isMarkedAsDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type IAddressSchema = mongoose.Document & IAdresses;

export const AddressModel =
  model<IAddressSchema>("Address", AddressSchema) || mongoose.models.Address;
