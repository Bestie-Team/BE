export const calcDateDiff = (firstDate: Date, secondDate: Date) => {
  return Math.abs(firstDate.getTime() - secondDate.getTime());
};

export const convertUnixToDate = (time: number) => {
  const date = Math.floor(time / (1000 * 60 * 60 * 24));
  return date;
};
