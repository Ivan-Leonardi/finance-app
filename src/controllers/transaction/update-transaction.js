import { serverError } from '../helpers/index.js';

export class UpdateTransactionController {
    async execute(httpRequest) {
        try {
        } catch (error) {
            console.error(error);

            return serverError();
        }
    }
}
