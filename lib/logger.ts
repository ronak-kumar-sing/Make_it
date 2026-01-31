import winston from 'winston'

const { combine, timestamp, printf, colorize, errors } = winston.format

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = `${timestamp} [${level}]: ${message}`
  
  if (Object.keys(metadata).length > 0) {
    log += ` ${JSON.stringify(metadata)}`
  }
  
  if (stack) {
    log += `\n${stack}`
  }
  
  return log
})

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  defaultMeta: { service: 'studystreak' },
  transports: [
    // Console transport (always enabled)
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        logFormat
      ),
    }),
  ],
})

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }))
  
  logger.add(new winston.transports.File({ 
    filename: 'logs/combined.log',
    maxsize: 5242880,
    maxFiles: 5,
  }))
}

// Helper functions for structured logging
export const logRequest = (
  method: string, 
  path: string, 
  statusCode: number, 
  duration: number,
  userId?: string
) => {
  logger.info('HTTP Request', {
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
    userId,
  })
}

export const logError = (
  error: Error, 
  context?: Record<string, unknown>
) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  })
}

export const logAI = (
  action: string,
  model: string,
  tokens?: number,
  duration?: number
) => {
  logger.info('AI Request', {
    action,
    model,
    tokens,
    duration: duration ? `${duration}ms` : undefined,
  })
}

export const logPerformance = (
  operation: string,
  duration: number,
  metadata?: Record<string, unknown>
) => {
  const level = duration > 1000 ? 'warn' : 'info'
  logger[level]('Performance', {
    operation,
    duration: `${duration}ms`,
    slow: duration > 1000,
    ...metadata,
  })
}

export default logger
