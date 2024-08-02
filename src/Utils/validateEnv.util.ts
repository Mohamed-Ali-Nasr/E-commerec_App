import { cleanEnv } from "envalid";
import { port, str } from "envalid/dist/validators";

export const env = cleanEnv(process.env, {
  PORT: port(),

  MONGODB_URI: str(),

  CLOUD_NAME: str(),
  API_KEY: str(),
  API_SECRET: str(),
  UPLOADS_FOLDER: str(),
});
