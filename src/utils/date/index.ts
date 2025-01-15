export const calcDiff = (firstDate: Date, secondDate: Date) => {
  return Math.abs(firstDate.getTime() - secondDate.getTime());
};

export const calcDiffDate = (firstDate: Date, secondDate: Date) => {
  const unixTime = Math.abs(firstDate.getTime() - secondDate.getTime());
  return convertUnixToDate(unixTime);
};

export const convertUnixToDate = (time: number) => {
  const date = Math.floor(time / (1000 * 60 * 60 * 24));
  return date;
};
