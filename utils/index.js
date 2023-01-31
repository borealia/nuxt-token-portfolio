export const shortAddress = (address) => {
  return `${address.slice(0, 5)}...${address.slice(-3)}`;
};

export const getRegNumber = (str) => {
  return Number(str)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
