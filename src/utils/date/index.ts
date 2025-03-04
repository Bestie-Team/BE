export const calcDiff = (firstDate: Date, secondDate: Date) => {
  return Math.abs(firstDate.getTime() - secondDate.getTime());
};

export const convertUnixToDate = (time: number) => {
  const date = Math.floor(time / (1000 * 60 * 60 * 24));
  return date;
};

export const calcDiffDate = (firstDate: Date, secondDate: Date) => {
  const unixTime = Math.abs(firstDate.getTime() - secondDate.getTime());
  return convertUnixToDate(unixTime);
};

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
