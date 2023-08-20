import { IDeviceIDsMapEntry } from "./data-structures";


export const deviceIDsMap: Array<IDeviceIDsMapEntry> = [


]

interface IUCBoard {
    name: string,
    pretty_name: string
    processors: Array<string>,
    processor_option: boolean,
}

export const boards: Record<string, IUCBoard> = {
    "uno": {
        name: "uno",
        pretty_name: "Arduino Uno",
        processors: [''],
        processor_option: false,
    },
    "nano": {
        name: "nano",
        pretty_name: "Arduino Nano",
        processors: ['ATmega328P', 'ATmega328P (Old Bootloader)', 'ATmega168P'],
        processor_option: true,
    },
    "leonardo": {
        name: "leonardo",
        pretty_name: "Arduino Leonardo",
        processors: [''],
        processor_option: false,
    },
    "atmega328pb": {
        name: "atmega328pb",
        pretty_name: "MiniCore Nano",
        processors: [''],
        processor_option: false,
    },
    "raspberry-pi-pico": {
        name: "raspberry-pi-pico",
        pretty_name: "Raspberry Pi Pico",
        processors: [''],
        processor_option: false,
    }
};
