// lib/logger.ts
import { writeFile, appendFile, mkdir } from 'fs/promises'
import { join } from 'path'

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: any
  userId?: string
  ip?: string
  userAgent?: string
}

class Logger {
  private logDir = join(process.cwd(), 'logs')

  async init() {
    try {
      await mkdir(this.logDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }
  }

  private async writeLog(entry: LogEntry) {
    await this.init()
    
    const logLine = JSON.stringify({
      ...entry,
      timestamp: entry.timestamp.toISOString()
    }) + '\n'

    const date = entry.timestamp.toISOString().split('T')[0]
    const filename = join(this.logDir, `${date}.log`)

    try {
      await appendFile(filename, logLine)
    } catch (error) {
      console.error('Failed to write log:', error)
    }
  }

  async log(level: LogLevel, message: string, context?: any, meta?: Partial<LogEntry>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      ...meta
    }

    await this.writeLog(entry)

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${entry.level}] ${entry.message}`, context || '')
    }
  }

  async error(message: string, error?: Error, context?: any, meta?: Partial<LogEntry>) {
    await this.log(LogLevel.ERROR, message, {
      error: error?.message,
      stack: error?.stack,
      ...context
    }, meta)
  }

  async warn(message: string, context?: any, meta?: Partial<LogEntry>) {
    await this.log(LogLevel.WARN, message, context, meta)
  }

  async info(message: string, context?: any, meta?: Partial<LogEntry>) {
    await this.log(LogLevel.INFO, message, context, meta)
  }

  async debug(message: string, context?: any, meta?: Partial<LogEntry>) {
    await this.log(LogLevel.DEBUG, message, context, meta)
  }
}

export const logger = new Logger()

