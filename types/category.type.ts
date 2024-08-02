import { Document, ObjectId } from "mongoose";

export interface ICategory extends Document {
  _id: string;
  name: string;
  slug: string;
  createdBy: ObjectId;
  Images: {
    secure_url: string;
    public_id: string;
  };
  customId: string;
}
