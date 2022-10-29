// try {
    const { app, BrowserWindow, ipcMain, shell } = require('electron');
    const fs = require('fs');
    const readline = require('readline');
    const http = require('https');
    const path = require('path');
    
    const prod = true;

    var Avrgirl = require('avrgirl-arduino');
    let win;
    function createWindow() {
        // console.log(process.versions.node);
        const width = 700, height = 420;
        win = new BrowserWindow({
            // width: 700,
            // height: 420,
            width    : width,
            height   : height,
            minWidth : width,
            minHeight: height,
            maxWidth : width,
            maxHeight: height,
            icon: path.resolve(__dirname, "/icon.ico"),
            frame: false,
            transparent: true,
            // resizable: false,
            
            webPreferences: {
                devTools: !prod,
                webSecurity: false,
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
            }
        });

        win.loadURL(path.resolve(__dirname, prod ? "alpha-upload/index.html" : "dist/alpha-upload/index.html"));

        if(!prod) win.webContents.openDevTools();

        win.on('closed', () => {
            win = null;
        });

        win.on('ready-to-show', () => {
            setTimeout(() => getPortsList().then((ports) => win.webContents.send("ports", ports)), 500);
        });

        getPortsList().then((ports) => win.webContents.send("ports", ports));
        setInterval(() => {
            getPortsList().then((ports) => win.webContents.send("ports", ports));
        }, 4000);
    }

    app.on('ready', createWindow);

    app.on('window-all-closed', () => {
        if(process.platform !== 'darwin') app.quit();
    });
    app.on('activate', () => {
        if(win === 'null') createWindow();
    });


    // IPC Events //
    ipcMain.on('close', (event, arg) => {
        win.close();
    });
    ipcMain.on('min', (event, arg) => {
        win.minimize();
    });
    ipcMain.on('linkto', (event, link) => {
        shell.openExternal(link);
    });
    ipcMain.on('upload', async (event, config) => {
        if(config.selected_program.isHex) {
            const file_name = getFileNameFromConfig(config);
            const avrgirl = generateBoardFromConfig(config);
            if(typeof avrgirl === "string") {
                console.log(avrgirl);
                win.webContents.send("upload-ret", avrgirl);
                return;
            }

            win.webContents.send("upload-ret", "Fetching file...");
            fetchFile(file_name)
                .then(() => {
                    win.webContents.send("upload-ret", "Checking file...");
                    checkFile(file_name)
                        .then(() => {
                            win.webContents.send("upload-ret", "Flashing file. Please wait...");
                            flashHexFile(avrgirl, file_name)
                                .then(() => {
                                    win.webContents.send("upload-ret", "Cleaning up...");
                                    removeFile(file_name)
                                        .then(() => win.webContents.send("upload-ret", "SUCCESS"))
                                        .catch(err => win.webContents.send("upload-ret", {text: "Failed to remove file.", error: err}) );
                                })
                                .catch(err => {
                                    win.webContents.send("upload-ret", {text: "Failed flash file to microcontroller.", error: err})
                                    removeFile(file_name).catch(err => win.webContents.send("upload-ret", {text: "Failed to remove file.", error: err}) );
                                });
                        })
                        .catch(err => win.webContents.send("upload-ret", {text: "Failed to find file.", error: err}));
                })
                .catch(err => win.webContents.send("upload-ret", {text: "Failed to acquire file from source.", error: err}));
        }
    });
    ipcMain.on('try-all', (event, arg) => {
        console.log("try-all arg:", arg);
    });

    // AVR Functions //
    function getPortsList() {
        let pc_ports = [];
        return new Promise((resolve, reject) => {
            Avrgirl.list(function(err, ports) {
                if(err) return reject(err);
                ports.forEach(item => {
                    if(typeof item.vendorId !== "undefined" && typeof item.productId !== "undefined") 
                        pc_ports.push({port: item.path, ids: {vendorid: item.vendorId, productid: item.productId}});
                });
                resolve(orderComPorts(pc_ports));
            });
        });
    }
    function generateBoardFromConfig(config) {
        let board = "";
        switch(config.microcontroller) {
            case "Arduino Uno":
                board = "uno";
                break;
            case "Arduino Nano":
                board = "nano";
                break;
            case "Arduino Leonardo":
                board = "leonardo";
                break;
            default: return "Failed to identify board type.";
        }
        if(config.port.length < 3) return "Failed to identify port.";

        return new Avrgirl({
            board: board,
            port: config.port,
        });
    }
    function flashHexFile(avrgirl, file_name) {
        return new Promise((resolve, reject) => {
            avrgirl.flash(file_name, function (error) {
                if(error)return reject(error);
                console.log("Flashed");
                resolve("OK");
            });
        });
    }

    // Other Functions //
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

    function orderComPorts(ports) {    
        // Order: CH3XX, FTDI, UNO_X, remainder
        let og_ports = ports, ordered_ports = [];
        let len = ports.length, count = 0;

        // Grab CH3XX
        og_ports.forEach(port => {
            if(port.ids.productid === pids.CH341_0 || port.ids.productid === pids.CH340_0) {
                ordered_ports.push({port: port.port, ids: {vendorid: port.ids.vendorid, productid: port.ids.productid}});
                count++;
            }
            port.ids.productid = "";
            port.ids.vendorid = "";
        });

        if(count >= len) return ordered_ports;

        // Grab FTDI
        og_ports.forEach(port => {
            if(port.ids.vendorid === vids.FTDI) {
                ordered_ports.push({port: port.port, ids: {vendorid: port.ids.vendorid, productid: port.ids.productid}});
                count++;
            }
            port.ids.productid = "";
            port.ids.vendorid = "";
        });

        if(count >= len) return ordered_ports;

        // Grab UNO_X
        og_ports.forEach(port => {
            if(port.ids.productid === pids.UNO_0 || port.ids.productid === pids.UNO_1 || port.ids.productid === pids.UNO_2) {
                ordered_ports.push({port: port.port, ids: {vendorid: port.ids.vendorid, productid: port.ids.productid}});
                count++;
            }
            port.ids.productid = "";
            port.ids.vendorid = "";
        });

        if(count >= len) return ordered_ports;

        // Remainder
        og_ports.forEach(port => {
            if(port.ids.productid !== "") {
                ordered_ports.push({port: port.port, ids: {vendorid: port.ids.vendorid, productid: port.ids.productid}});
            }
        });

        return ordered_ports;

    }


    const vids = {
        ARDUINO:    "2341",
        ARDUINO_1:  "2A03",
        FTDI:       "0403",
        CP210X:     "10C4",
        DCCDUINO:   "1A86",
        WCH:        "4348",
        SPARKFUN:   "1B4F",
        ADAFRUIT:   "239A",
        RASPBERRY:  "2e8a"
    }
    const pids = {
        CH341_0:    "5523",
        CH340_0:    "7523",
        UNO_0:      "0043",
        UNO_1:      "0001",
        UNO_2:      "0243",
        LEONARDO_0: "0036",
        LEONARDO_1: "8036",
    }
// } catch (error) {
//     console.log(error);
// }


