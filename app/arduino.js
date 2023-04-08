var Arduino = require('avrgirl-arduino');

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

const getPortsList = function getPortsList() {
    let pc_ports = [];
    return new Promise((resolve, reject) => {
        Arduino.list(function(err, ports) {
            if(err) return reject(err);
            ports.forEach(item => {
                if(typeof item.vendorId !== "undefined" && typeof item.productId !== "undefined")
                    pc_ports.push({port: item.path, ids: {vendorid: item.vendorId, productid: item.productId}});
            });
            resolve(orderComPorts(pc_ports));
        });
    });
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

const generateBoardFromConfig = function generateBoardFromConfig(config) {
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

    return new Arduino({
        board: board,
        port: config.port,
    });
}

const flashHexFile = function flashHexFile(board, file_name) {
    return new Promise((resolve, reject) => {
        board.flash(file_name, function (error) {
            if(error) return reject(error);
            console.log("Flashed");
            resolve("OK");
        });
    });
}

module.exports = { getPortsList, generateBoardFromConfig, flashHexFile }
