const fs = require('fs');
const http = require('follow-redirects').https;
const readline = require('readline');

const fetchFile = function fetchFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    const request = http.get(url, (response) => {
      response.pipe(file);
    }).on('error', (e) => {
      console.error(e);
      reject(e);
    });

    file.on('finish', () => {
      console.log("Complete");
      resolve("OK");
    });
  });
}

const checkFile = function checkFile(filePath) {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      console.log("File doesn't exist.");
      return reject("File doesn't exist.");
    }

    if ((await getFirstLine(filePath))[0] !== ":") {
      console.log("File doesn't exist.");
      return reject("File doesn't exist.");
    }

    console.log("File Exists");
    resolve("OK");
  });
}

const removeFile = function removeFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, err => {
      if (err) return reject(err);
      console.log("File Removed");
      resolve("OK");
    })
  });
}

async function getFirstLine(filePath) {
  const readable = fs.createReadStream(filePath);
  const reader = readline.createInterface({ input: readable });
  const line = await new Promise((resolve) => {
    reader.on('line', (line) => {
      reader.close();
      resolve(line);
    });
  });
  readable.close();

  return line;
}

module.exports = { fetchFile, checkFile, removeFile }
