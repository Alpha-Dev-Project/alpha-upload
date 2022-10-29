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
    selected_program: number,
    selected_program_version: number,
}