import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { createApp } from './app.js';

try {
  const app = createApp();
  if (app.locals.dataSource === 'mongodb') await connectDB();
  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  const server = app.listen(port, () => console.log('Portfolio listening on port ' + port));
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      server.close(async () => { await mongoose.disconnect(); process.exit(0); });
      setTimeout(() => process.exit(1), 10000).unref();
    });
  }
} catch {
  console.error('Unable to start portfolio. Check PORT, DATA_SOURCE and MongoDB configuration.');
  process.exitCode = 1;
}
