import { BackendContainer } from './container';

const container = new BackendContainer();
const server = container.start();

const shutdown = (): void => {
    server.close(() => {
        void container.database.close().finally(() => process.exit(0));
    });
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
