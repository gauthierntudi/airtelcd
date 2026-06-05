function isTransientPoolError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const msg = e.message.toLowerCase();
  return (
    msg.includes("connection pool") ||
    msg.includes("timed out fetching") ||
    msg.includes("can't reach database")
  );
}

/** Une nouvelle tentative après saturation passagère du pool (Neon / HMR). */
export async function withPrismaRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (!isTransientPoolError(e)) throw e;
    await new Promise((r) => setTimeout(r, 500));
    return fn();
  }
}
