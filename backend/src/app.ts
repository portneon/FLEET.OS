import express from 'express';
import cors from 'cors';
import { Routes } from './shared/interfaces/routes.interface';

export class App {
    public app: express.Application;
    public port: string | number;

    constructor(routes: Routes[]) {
        this.app = express();
        this.port = process.env.PORT || 3000;

        this.initializeMiddlewares();
        this.initializeRoutes(routes);
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`Server is running at http://localhost:${this.port}`);
        });
    }

    private initializeMiddlewares() {
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
        ];

        this.app.use(cors({
            origin: (origin, callback) => {
                // Allow requests with no origin (server-to-server, curl, etc.)
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(null, true); // permissive in dev — restrict in prod
                }
            },
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-id', 'x-admin-email'],
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        }));
        this.app.use(express.json());
    }

    private initializeRoutes(routes: Routes[]) {
        this.app.get('/', (req, res) => {
            res.json({ message: 'Welcome to the FleetOS API with OOP Architecture' });
        });

        routes.forEach(route => {
            this.app.use('/api', route.router);
        });
    }
}
