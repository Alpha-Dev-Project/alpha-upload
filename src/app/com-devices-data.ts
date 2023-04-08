import { IDeviceIDsMapEntry } from "./data-structures";


export const deviceIDsMap: Array<IDeviceIDsMapEntry> = [


]

interface IUCBoard {
    name: string,
    pretty_name: string
    processors: Array<string>,
    processor_option: boolean,
}

export const boards: Array<IUCBoard> = [
    {
        name: "arduino-uno",
        pretty_name: "Arduino Uno",
        processors: [''],
        processor_option: false,
    },
    {
        name: "arduino-nano",
        pretty_name: "Arduino Nano",
        processors: ['ATmega328P', 'ATmega328P (Old Bootloader)', 'ATmega168P'],
        processor_option: true,
    },
    {
        name: "arduino-leonardo",
        pretty_name: "Arduino Leonardo",
        processors: [''],
        processor_option: false,
    },
    {
        name: "raspberry-pi-pico",
        pretty_name: "Raspberry Pi Pico",
        processors: [''],
        processor_option: false,
    }
];

export var boards_indices: Array<string> = []

function fillBoardsIndices() {
    for(let i: number = 0; i<boards.length; i++)
        boards_indices[i] = boards[i].pretty_name;
}
fillBoardsIndices();

export type BoardsNames = "arduino-uno" | "arduino-nano" | "raspberry-pi-pico";