import bcrypt from 'bcrypt';
import { PostgresGetUserByEmailRepository } from '../repositories/postgres/get-user-by-email.js';
import { EmailAlreadyInUseError } from '../errors/user.js';
import { PostgresUpdateUserRepository } from '../repositories/postgres/update-user.js';

export class UpdateUserUseCase {
    async execute(userId, updateUserParams) {
        //1. se o email estiver sendo atualizado, verificar se ele já está em uso por outro usuário.
        const postgresgetUserByEmailRepository =
            new PostgresGetUserByEmailRepository();

        const userWithProvidedEmail =
            await postgresgetUserByEmailRepository.execute(
                updateUserParams.email
            );

        if (userWithProvidedEmail && userWithProvidedEmail.id !== userId) {
            throw new EmailAlreadyInUseError(updateUserParams.email);
        }

        const user = {
            ...updateUserParams,
        };

        //2. se a senha estiver sendo atuaizada, criptografá-la.
        if (updateUserParams.password) {
            const hashedPassword = await bcrypt.hash(
                updateUserParams.password,
                10
            );

            user.password = hashedPassword;
        }

        //3. chamar o repository para atualizar o usuário.
        const postgresUpdateUserRepository = new PostgresUpdateUserRepository();

        const updateUser = await postgresUpdateUserRepository.execute(
            userId,
            user
        );

        return updateUser;
    }
}
