import { Repo } from './github';

export interface IIds {
    productid: string,
    vendorid: string
}

export interface IComPort {
    port: string,
    ids: IIds
}

export interface IDeviceIDsMapEntry {
    vendorID: string,
    productID: string,
    devices: Array<string>
}

export interface IConfig {
    port: string,
    microcontroller: string,
    processor: string,
    selected_firmware: number,
    selected_firmware_version: number,
}

export interface IFirmware {
    name: string,
    creator: string,
    description: string,
    repoURI: string,
    repo: Repo,
    enabled: boolean,
}