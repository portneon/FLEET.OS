import cors from 'cors';
import express, { Application, Router } from 'express';
import { Server } from 'node:http';

export interface AppRoute {
    readonly path: string;
    readonly router: Router;
}

export class App {
    readonly server: Application;

    constructor(routes: readonly AppRoute[] = []) {
        this.server = express();
        this.server.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
        this.server.use(express.json({ limit: '1mb' }));
        this.server.get('/health', (_request, response) => response.json({ status: 'ok' }));

        for (const route of routes) {
            this.server.use(`/api${route.path}`, route.router);
        }
    }

    listen(port = Number(process.env.PORT || 3001)): Server {
        return this.server.listen(port, () => {
            console.log(`FleetOS API listening on port ${port}`);
        });
    }
}
