import { createClient } from 'redis';
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from './env.js';

const redisClient = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT
  },
  password: REDIS_PASSWORD
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Redis Connected'));

await redisClient.connect();

export default redisClient;