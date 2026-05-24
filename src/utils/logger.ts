type Level = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function emit(level: Level, scope: string, message: string, meta?: unknown): void {
  const ts = new Date().toISOString();
  const base = `${ts} [${level}] [${scope}] ${message}`;
  if (meta !== undefined) {
    console.log(base, typeof meta === 'string' ? meta : JSON.stringify(meta));
  } else {
    console.log(base);
  }
}

/**
 * Tiny structured logger. Prefixing every line with a scope + level keeps Allure/CI
 * output greppable without pulling in a heavy logging dependency.
 */
export function createLogger(scope: string) {
  return {
    info: (msg: string, meta?: unknown) => emit('INFO', scope, msg, meta),
    warn: (msg: string, meta?: unknown) => emit('WARN', scope, msg, meta),
    error: (msg: string, meta?: unknown) => emit('ERROR', scope, msg, meta),
    debug: (msg: string, meta?: unknown) => {
      if (process.env.DEBUG) emit('DEBUG', scope, msg, meta);
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;
