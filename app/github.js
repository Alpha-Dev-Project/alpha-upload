function getFileNameFromConfig(config) {
  let name = `${config.selected_program.name.toLowerCase()}-${config.microcontroller.toLowerCase().replaceAll(' ', '-')}`

  switch(config.microcontroller) {
    case "Arduino Uno":
    case "Arduino Leonardo":
      break;
    case "Arduino Nano":
      name += "-"+config.processor.toLowerCase().replaceAll(" ", "-").replaceAll("(", "").replaceAll(")", "");
      break;
    case "Raspberry Pi Pico":
      break;
    default: break;
  }

  return `${name}-${config.selected_program.versions[config.selected_program_version]}.hex`;
}

function fetchFile(file_name) {
  return new Promise((resolve, reject) => {
      const loc = `https://raw.githubusercontent.com/KATSU-dev/temp-hex-repo/main/${file_name}`;

      const file = fs.createWriteStream(file_name);
      const request = http.get(loc, function(response) {
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

function checkFile(file_name) {
  return new Promise(async (resolve, reject) => {
    if(!fs.existsSync(`${file_name}`)) {
      console.log("File doesn't exist.");
      return reject("File doesn't exist.");
    }

    if((await getFirstLine(file_name))[0] !== ":") {
      console.log("File doesn't exist.");
      return reject("File doesn't exist.");
    }

    console.log("File Exists");
    resolve("OK");
  });
}

function removeFile(file_name) {
  return new Promise((resolve, reject) => {
    fs.unlink(file_name, err => {
      if(err) return reject(err);
      console.log("File Removed");
      resolve("OK");
    })
  });
}

async function getFirstLine(pathToFile) {
  const readable = fs.createReadStream(pathToFile);
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

const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  userAgent: "Alpha Upload"
})
