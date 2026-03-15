"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
class App {
    app;
    port;
    constructor(routes) {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || 3000;
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server is running at http://localhost:${this.port}`);
        });
    }
    initializeMiddlewares() {
        this.app.use(express_1.default.json());
    }
    initializeRoutes(routes) {
        this.app.get('/', (req, res) => {
            res.json({ message: 'Welcome to the FleetOS API with OOP Architecture' });
        });
        routes.forEach(route => {
            this.app.use('/api', route.router);
        });
    }
}
exports.App = App;
