export const filterId = (targetId: string, Ids: string[]) => {
  return Ids.filter((userId) => userId !== targetId);
};
