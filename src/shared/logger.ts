import { createLogger, format, transports } from 'winston';
import type { Logger } from 'winston';

const SECRET_PATTERNS = [
  /Authorization:\s*\S+/gi,
  /api[-_]?token[=:]\s*\S+/gi,
  /password[=:]\s*\S+/gi,
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g,
  /Basic\s+[A-Za-z0-9+/]+=*/g,
];

function redactSecrets(message: string): string {
  let result = message;
  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}

const redactFormat = format((info) => {
  if (typeof info.message === 'string') {
    info.message = redactSecrets(info.message);
  }
  return info;
});

let rootLogger: Logger | null = null;

export function initLogger(level: string): void {
  rootLogger = createLogger({
    level,
    format: format.combine(
      redactFormat(),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.printf(({ level: lvl, message, timestamp, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${String(timestamp)}] ${String(lvl).toUpperCase()}: ${String(message)}${metaStr}`;
      }),
    ),
    transports: [new transports.Console({ stderrLevels: ['error', 'warn', 'info', 'debug'] })],
  });
}

export interface ContextLogger {
  error(msg: string, meta?: object): void;
  warn(msg: string, meta?: object): void;
  info(msg: string, meta?: object): void;
  debug(msg: string, meta?: object): void;
}

export function getLogger(context: string): ContextLogger {
  if (!rootLogger) initLogger('warn');

  const l = rootLogger!;
  const prefix = `[${context}]`;
  return {
    error(msg, meta) { l.error(`${prefix} ${msg}`, meta); },
    warn(msg, meta) { l.warn(`${prefix} ${msg}`, meta); },
    info(msg, meta) { l.info(`${prefix} ${msg}`, meta); },
    debug(msg, meta) { l.debug(`${prefix} ${msg}`, meta); },
  };
}
