import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

const app: Application = express();

// Security & parsing
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
