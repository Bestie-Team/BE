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

  static create(input: GroupPrototype, idGen: () => string, stdDate: Date) {
    return new GroupEntity(
      idGen(),
      input.name,
      input.description,
      input.groupImageUrl,
      input.ownerId,
      stdDate,
      stdDate,
    );
  }
}
