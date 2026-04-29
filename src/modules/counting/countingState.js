const countingData = {
  channelId: "1494120329444855888", // 🔥
  currentNumber: 0,
};

function getNextNumber() {
  return countingData.currentNumber + 1;
}

function increment() {
  countingData.currentNumber++;
}

function reset() {
  countingData.currentNumber = 0;
}

module.exports = {
  countingData,
  getNextNumber,
  increment,
  reset
};