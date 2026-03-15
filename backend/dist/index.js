"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const user_routes_1 = require("./routes/user.routes");
const app = new app_1.App([
    new user_routes_1.UserRoute(),
]);
app.listen();
