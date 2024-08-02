import mongoose from "mongoose";
import { env } from "../src/Utils";

const db_connection = () => {
  mongoose.Promise = Promise;
  mongoose
    .connect(env.MONGODB_URI)
    .then(() => {
      console.log("Connected to Mongo");
    })
    .catch((error) => {
      console.log("Unable to connect to Mongo : ");
      console.log(error);
    });
  mongoose.connection.on("error", (error: Error) => console.log(error));
};

export default db_connection;
