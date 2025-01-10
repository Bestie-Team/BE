import { transports, format } from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
  WinstonModuleOptions,
} from 'nest-winston';

export const windstonOptions: WinstonModuleOptions = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
  transports: [
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.File({
      filename: 'logs/combined.log',
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? format.simple()
          : format.combine(
              format.timestamp(),
              format.ms(),
              nestWinstonModuleUtilities.format.nestLike('Lighty', {
                colors: true,
                prettyPrint: true,
              }),
            ),
    }),
  ],
};

export const winstonLogger = WinstonModule.createLogger(windstonOptions);
