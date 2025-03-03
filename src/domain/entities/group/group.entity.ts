import { GroupPrototype } from 'src/domain/types/group.types';

export class GroupEntity {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string,
    readonly groupImageUrl: string,
    readonly ownerId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(
    input: GroupPrototype,
    idGen: () => string,
    stdDate: Date,
  ): GroupEntity {
    return {
      ...input,
      id: idGen(),
      createdAt: stdDate,
      updatedAt: stdDate,
    };
  }
}
