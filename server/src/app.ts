import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './routes';

import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

const app: Application = express();

const allowedOrigins: string[] = [
  'http://localhost:5173',
];

// Security & parsing
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
