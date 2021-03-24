import "reflect-metadata"

import path from 'path';
import fs from 'fs';
import uploadConfig from '@config/upload';
import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IUsersRepository from '../repositories/IUsersRepository';
import IStoreProvider from '@shared/container/providers/StoreProvider/models/IStoreProvider';

import User from '@modules/users/infra/typeorm/entities/User';

interface IRequest {
  user_id: string;
  avatarFilename: string;
}
@injectable()
class UpdateUserAvatarService {
  constructor(
    @inject('UsersRepository')
    private userRepository: IUsersRepository,

    @inject('StoreProvider')
    private storeProvider: IStoreProvider,
  ) { }

  public async execute({ user_id, avatarFilename }: IRequest): Promise<User> {
    const user = await this.userRepository.findById(user_id);
    if (!user) {
      throw new AppError('Only authenticated users can change avatar', 401);
    }

    if (user.avatar) {
      await this.storeProvider.deleteFile(user.avatar)
    }

    const fileName = await this.storeProvider.saveFile(avatarFilename)

    user.avatar = fileName;
    await this.userRepository.save(user);

    return user;
  }
}

export default UpdateUserAvatarService;
