type LogMeta = Record<string, unknown>;

function safeMeta(meta?: LogMeta): string {
  if (!meta) {
    return "";
  }

  return JSON.stringify(meta, (key, value) => {
    if (typeof key === "string" && key.toLowerCase().includes("key")) {
      return "[redacted]";
    }
    return value;
  });
}

function nowIso(): string {
  return new Date().toISOString();
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    console.info(`[${nowIso()}] INFO ${message} ${safeMeta(meta)}`.trim());
  },
  warn(message: string, meta?: LogMeta) {
    console.warn(`[${nowIso()}] WARN ${message} ${safeMeta(meta)}`.trim());
  },
  error(message: string, meta?: LogMeta) {
    console.error(`[${nowIso()}] ERROR ${message} ${safeMeta(meta)}`.trim());
  },
};
