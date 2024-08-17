import { cleanEnv } from "envalid";
import { num, port, str } from "envalid/dist/validators";

export const env = cleanEnv(process.env, {
  PORT: port(),

  MONGODB_URI: str(),

  CLOUD_NAME: str(),
  API_KEY: str(),
  API_SECRET: str(),
  UPLOADS_FOLDER: str(),

  SALT_ROUNDS: num(),
  JWT_SIGNIN: str(),
  JWT_VERIFIED_EMAIL: str(),
  JWT_RESET_PASSWORD: str(),

  MAIL_HOST: str(),
  MAIL_PORT: port(),
  MAIL_USERNAME: str(),
  MAIL_PASSWORD: str(),

  CITY_API_KEY: str(),
});
