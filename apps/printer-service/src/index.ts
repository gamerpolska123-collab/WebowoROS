import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function main() {
  console.log('Printer Service starting...');
  console.log('Connected to Redis');

  // TODO: Subscribe to Redis Pub/Sub for print jobs
  // TODO: Integrate node-escpos for thermal printers

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    await redis.quit();
    console.log('Redis connection closed.');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Keep process alive
  setInterval(() => {}, 1000);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
