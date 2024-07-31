import { EmailAlreadyInUseError } from '../../errors/user.js';
import {
    checkIfEmailIsValid,
    checkIfPasswordIsValid,
    emailIsAlreadyInUseResponse,
    invalidPasswordResponse,
    badRequest,
    created,
    serverError,
    validateRequiredFields,
    requiredFieldIsMissingResponse,
} from '../helpers/index.js';
export class CreateUserController {
    constructor(createUserUseCase) {
        this.createUserUseCase = createUserUseCase;
    }
    async execute(httpRequest) {
        try {
            const params = httpRequest.body;

            //validar a requisição (campos obrigatórios, tamanho da senha e e-mail)
            const requireFields = [
                'first_name',
                'last_name',
                'email',
                'password',
            ];

            const { ok: RequiredFieldsWereProvided, missingField } =
                validateRequiredFields(params, requireFields);

            if (!RequiredFieldsWereProvided) {
                return requiredFieldIsMissingResponse(missingField);
            }

            for (const field of requireFields) {
                if (!params[field] || params[field].trim().length === 0) {
                    return badRequest({ message: `Missing param: ${field}` });
                }
            }

            const passwordIsValid = checkIfPasswordIsValid(params.password);

            if (!passwordIsValid) {
                return invalidPasswordResponse();
            }

            const emailIsValid = checkIfEmailIsValid(params.email);

            if (!emailIsValid) {
                return emailIsAlreadyInUseResponse();
            }

            //chamar o use case

            const createduser = await this.createUserUseCase.execute(params);

            //retornar a resposta para o usuario (status code)
            return created(createduser);
        } catch (error) {
            if (error instanceof EmailAlreadyInUseError) {
                return badRequest({ message: error.message });
            }
            console.error(error);
            return serverError();
        }
    }
}
