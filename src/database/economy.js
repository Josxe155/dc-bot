const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'economy.json');

function loadData() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(filePath));
}

function saveData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getUser(userId) {
  const data = loadData();

  if (!data[userId]) {
    data[userId] = {
      money: 0,
      lastDaily: 0
    };
    saveData(data);
  }

  return data[userId];
}

function updateUser(userId, newData) {
  const data = loadData();
  data[userId] = { ...data[userId], ...newData };
  saveData(data);
}

module.exports = {
  getUser,
  updateUser
};