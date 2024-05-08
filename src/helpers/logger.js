// const winston = require('winston');
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
// const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.printf(({ timestamp, level, message }) => {
			return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
		}),
	),
	transports: [
		new winston.transports.Console(),
		new DailyRotateFile({
			filename: 'logs/application-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '7d',
		}),
	],
});

export default logger;

// module.exports = logger;
