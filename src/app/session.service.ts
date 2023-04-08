import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isDevMode, Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron-fresh';

import { boards } from './com-devices-data';
import { IComPort, IConfig, IFirmware } from './data-structures';
import { getRepo } from './github';

const firmwareURL = "https://raw.githubusercontent.com/Alpha-Dev-Project/alpha-upload/master/firmware.json"
const firmwareLocal = "../firmware.json"

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  public isLoaded: boolean = false;
  public com_ports: Array<IComPort> = [];
  public firmware!: Array<IFirmware>;
  public boards = boards;
  public config: IConfig = {
    port: "COM1",
    microcontroller: "Arduino Nano",
    processor: "ATmega328P",
    selected_firmware: 0,
    selected_firmware_version: 0
  }

  constructor(private electron: ElectronService,
              private http: HttpClient) {
    this.getFirmware();

    this.electron.ipcRenderer.once("ports", (event, ports) => {
      this.com_ports = ports;
      if(this.com_ports.length > 0) this.config.port = ports[0].port;
      this.electron.ipcRenderer.on("ports", (event, ports) => this.com_ports = ports );
    });
  }

  private getFirmware() {
    let firmwareURI = firmwareURL
    if (isDevMode()) {
      firmwareURI = firmwareLocal
    }

    this.http.get<Array<IFirmware>>(firmwareURI)
    .subscribe({
      next: (firmware: Array<IFirmware>) => {
        firmware = firmware.filter((element) => element.enabled);

        let promises: Array<Promise<Boolean>> = [];
        firmware.forEach((value, index, array) => {
          promises.push(new Promise((resolve) => {
            getRepo(value.repoURI).then((repo) => {
              value.repo = repo;
              array[index] = value;
              resolve(true);
            })
          }))
        })

        Promise.all(promises).then((results) => {
          this.isLoaded = results.every(Boolean)
          this.firmware = firmware;
          this.config.selected_firmware_version = this.firmware[this.config.selected_firmware].repo.getVersions().length-1;
        })
      },
      error: (error: any) => {
        console.log("E", error);
      }
    });
  }

  public selectFirmware(firmware: number) {
    this.config.selected_firmware = firmware;
    this.config.selected_firmware_version = this.firmware[this.config.selected_firmware].repo.getVersions().length-1;
  }

  public versionChange(dir: string) {
    const len = this.firmware[this.config.selected_firmware].repo.getVersions().length-1;
    switch(dir) {
      case "left":
        this.config.selected_firmware_version = this.config.selected_firmware_version - 1;
        this.config.selected_firmware_version = this.config.selected_firmware_version < 0 ? 0 : this.config.selected_firmware_version;
        break;
      case "right":
        this.config.selected_firmware_version = this.config.selected_firmware_version + 1;
        this.config.selected_firmware_version = this.config.selected_firmware_version > len ? len : this.config.selected_firmware_version;
        break;
      default: break;
    }
  }

  public clickedMoreInfo() {
    this.electron.ipcRenderer.send("linkto", this.firmware[this.config.selected_firmware].repo.link);
  }
}