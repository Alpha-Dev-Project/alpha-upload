export interface IProgram {
    name: string,
    creator: string,
    description: string,
    link: string,
    available_boards: Array<string>,
    enabled: boolean,
    versions: Array<string>,
    isHex: boolean,
}

export const programs: Array<IProgram> = [
    {
        name: "dmcomm",
        description: "Basic VPet Interface program. Used by w0rld, Alpha Serial, and Alpha Terminal.",
        creator: "BladeSabre",
        link: "https://github.com/dmcomm/dmcomm-project/releases",
        available_boards: ['Arduino Uno', 'Arduino Nano', 'Arduino Leonardo'],
        enabled: true,
        versions: ['V1.0.0'],
        isHex: true,
    },
]

// export const programs: Array<IProgram> = [
//     {
//         name: "dmcomm",
//         description: "Basic VPet Interface program. Used by w0rld, Alpha Serial, and Alpha Terminal.",
//         creator: "BladeSabre",
//         link: "https://github.com/dmcomm/dmcomm-project/releases",
//         available_boards: ['Arduino Uno', 'Arduino Nano', 'Arduino Leonardo'],
//         enabled: true,
//         versions: ['V1.0.0', 'V2.0.0', 'V3.0.0', 'V4.0.0'],
//         isHex: true,
//     },
//     {
//         name: "LinkCom",
//         description: "VPet Interface program for realtime battles. Used by Alpha Link.",
//         creator: "Ben | Katsu",
//         link: "https://www.alphahub.site/",
//         available_boards: ['Arduino Uno', 'Arduino Nano', 'Arduino Leonardo'],
//         enabled: true,
//         versions: ['V1.0.0', 'V2.0.0'],
//         isHex: true,
//     },
//     // {
//     //     name: "WiFiCom",
//     //     creator: "Ben | Katsu",
//     //     description: "",
//     //     link: "",
//     //     available_architectures: ['Raspberry Pi Pico'],
//     //     enabled: false,
//     //     versions: ['V0.4.0'],
//     //     isHex: false,
//     // }
// ]