import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { E_USER_ENTITY_KEYS, User } from '../db/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO } from './users.dto';
import { map } from 'lodash';
import { E_ROLE_ENTITY_KEYS } from '../db/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  public async find(options?: FindManyOptions<User>): Promise<Array<User>> {
    return this.usersRepository.find({
      ...options,
    });
  }

  public async findOne(options?: FindOneOptions<User>): Promise<User | null> {
    return this.usersRepository.findOne({
      ...options,
    });
  }

  /**
   * Create a user
   * @param createDto user data
   */
  public async create(createDto: CreateUserDTO): Promise<User> {
    const user = this.usersRepository.create({
      ...createDto,
      ...(createDto[E_USER_ENTITY_KEYS.ROLES]?.length && {
        [E_USER_ENTITY_KEYS.ROLES]: map(
          createDto[E_USER_ENTITY_KEYS.ROLES],
          (r) => ({
            [E_ROLE_ENTITY_KEYS.NAME]: r,
          }),
        ),
      }),
    });

    return await this.usersRepository.save(user);
  }

  /**
   * Set refresh token for user
   * @param id user id
   * @param refreshToken refresh token
   */
  public async setRefreshToken(
    id: string,
    refreshToken: string,
  ): Promise<void> {
    await this.usersRepository.update(id, {
      [E_USER_ENTITY_KEYS.REFRESH_TOKEN]: refreshToken,
    });
  }
}
