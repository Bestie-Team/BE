import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/domain/entities/user/user.entity';
import { UsersRepository } from 'src/domain/interface/user/users.repository';

@Injectable()
export class UsersWriter {
  constructor(
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(user: UserEntity) {
    await this.usersRepository.save(user);
  }

  async updateProfileImage(userId: string, profileImageUrl: string) {
    await this.usersRepository.update({ id: userId, profileImageUrl });
  }

  async updateAccountId(userId: string, accountId: string) {
    await this.usersRepository.update({
      id: userId,
      updatedAt: new Date(),
      accountId,
    });
  }

  async updateNotificationToken(token: string, userId: string) {
    await this.usersRepository.update({
      id: userId,
      notificationToken: token,
      serviceNotificationConsent: true,
    });
  }

  async resetDeletedAt(id: string) {
    await this.usersRepository.update({ id, deletedAt: null });
  }

  async delete(id: string) {
    await this.usersRepository.delete(id);
  }
}
