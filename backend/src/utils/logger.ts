// src/utils/logger.ts

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toUpperCase();

const LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLevel = LEVELS[LOG_LEVEL as keyof typeof LEVELS] ?? LEVELS.INFO;

function formatDate(): string {
  return new Date().toISOString();
}

function log(level: string, message: string, data?: any) {
  const levelNum = LEVELS[level as keyof typeof LEVELS] ?? 2;
  
  if (levelNum > currentLevel) {
    return;
  }

  const timestamp = formatDate();
  const levelStr = level.padEnd(6);
  const output = `[${timestamp}] [${levelStr}] ${message}`;

  if (data) {
    console.log(output, JSON.stringify(data, null, 2));
  } else {
    console.log(output);
  }
}

export default {
  error: (msg: string, data?: any) => log('ERROR', msg, data),
  warn: (msg: string, data?: any) => log('WARN', msg, data),
  info: (msg: string, data?: any) => log('INFO', msg, data),
  debug: (msg: string, data?: any) => log('DEBUG', msg, data)
};
