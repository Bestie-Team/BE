import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // DB
  DATABASE_URL: Joi.string().required(),
  // AWS S3
  AWS_BUCKET_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_BUCKEY_NAME: Joi.string().required(),
  // JWT
  JWT_SECRET_KEY: Joi.string().required(),
  ACCESS_TOKEN_EXPIRE: Joi.string().required(),
  REFRESH_TOKEN_EXPIRE: Joi.string().required(),
  //Sentry
  DSN: Joi.string().required(),
  // FCM
  FCM_PROJECT_ID: Joi.string().required(),
  FCM_PRIVATE_KEY: Joi.string().required(),
  FCM_CLIENT_EMAIL: Joi.string().required(),
});
