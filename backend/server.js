import app from './src/app.js';
import connectDB from './src/config/db.js';
import { PORT, NODE_ENV } from './src/config/env.js';

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection:', err);
  process.exit(1);
});