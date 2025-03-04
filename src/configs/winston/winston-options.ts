import { transports, format } from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
  WinstonModuleOptions,
} from 'nest-winston';
import * as WinstonCloudWatch from 'winston-cloudwatch';
import * as Transport from 'winston-transport';

const isProduction = process.env.NODE_ENV === 'production';

const transportList: Transport[] = [
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
    format: isProduction
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
];

if (isProduction) {
  transportList.push(
    new WinstonCloudWatch({
      logGroupName: process.env.CLOUDWATCH_LOG_GROUP,
      logStreamName: process.env.CLOUDWATCH_LOG_STREAM,
      awsRegion: process.env.CLOUDWATCH_REGION,
      jsonMessage: true,
    }),
  );
}

export const windstonOptions: WinstonModuleOptions = {
  level: isProduction ? 'info' : 'silly',
  transports: transportList,
};

export const winstonLogger = WinstonModule.createLogger(windstonOptions);
