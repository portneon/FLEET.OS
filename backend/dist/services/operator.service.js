"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../prisma");
class OperatorService {
    constructor() { }
    async getOperators(userID) {
        let operator = prisma_1.prisma.operator.findMany({ userID: userID });
        if (!operator) {
            return 'No operator Found';
        }
        else {
            return operator;
        }
    }
}
exports.default = new OperatorService();
