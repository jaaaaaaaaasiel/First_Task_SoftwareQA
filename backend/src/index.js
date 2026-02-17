import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import ordersRoutes from './routes/orders.js';
import establishmentsRoutes from './routes/establishments.js';
import walletRoutes from './routes/wallet.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/establishments', establishmentsRoutes);
app.use('/api/wallet', walletRoutes);
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`The Fast Food Salle :${PORT}`));
