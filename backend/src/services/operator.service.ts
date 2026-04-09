import {prisma} from '../prisma'
class OperatorService{
    constructor() { }
    
    async getOperators(userID: string) {
        let operator = prisma.operator.findMany({ userID: userID })
        if (!operator) {
            return 'No operator Found'

        } else {
            return operator
        }
    }
    

}



export default new OperatorService();

