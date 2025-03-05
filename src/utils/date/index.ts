export const calcDateDiff = (
  startDate: Date,
  endDate: Date,
  unit: 'y' | 'm' | 'd',
): number => {
  const timeDifference = startDate.getTime() - endDate.getTime();
  const dayDifference = timeDifference / (1000 * 60 * 60 * 24);

  if (unit === 'd') {
    return Math.floor(dayDifference);
  }
  if (unit === 'm') {
    return Math.floor(dayDifference);
  }
  if (unit === 'y') {
    return Math.floor(dayDifference);
  }
  throw new Error('invalid unit');
};
