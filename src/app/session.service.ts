import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { boards } from './com-devices-data';
import { IComPort, IConfig } from './data-structures';
import { IProgram, programs } from './programs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  // public selected_port: number = 0;
  // public selected_program: number = 0;
  // public selected_program_version: number = 0;
  // public com_ports: Array<IComPort> = [
  //   {
  //     port: 'COM1',
  //     ids: {
  //       vendorid: "abcd",
  //       productid: "efgh"
  //     }
  //   },
  //   {
  //     port: 'COM2',
  //     ids: {
  //       vendorid: "abcd",
  //       productid: "efgh"
  //     }
  //   },
  //   {
  //     port: 'COM3',
  //     ids: {
  //       vendorid: "abcd",
  //       productid: "efgh"
  //     }
  //   },
  //   {
  //     port: 'COM4',
  //     ids: {
  //       vendorid: "abcd",
  //       productid: "efgh"
  //     }
  //   },
  // ];
  public com_ports: Array<IComPort> = [];
  public programs!: Array<IProgram>;
  public boards = boards;
  public config: IConfig = { 
    port: "COM1",
    microcontroller: "Arduino Nano",
    processor: "ATmega328P",
    selected_program: 0,
    selected_program_version: 0
  }

  constructor(private electron: ElectronService,
              private http: HttpClient) {
    this.programs = programs;
    this.getPrograms();

    this.electron.ipcRenderer.once("ports", (event, ports) => {
      this.com_ports = ports;
      if(this.com_ports.length > 0) this.config.port = ports[0].port;
      this.electron.ipcRenderer.on("ports", (event, ports) => this.com_ports = ports );
    });
    
    this.config.selected_program_version = this.programs[this.config.selected_program].versions.length-1;
    
  }

  private getPrograms() {   
    this.http.get<Array<IProgram>>("https://raw.githubusercontent.com/KATSU-dev/temp-hex-repo/main/programs.json")
    .subscribe({
      next: (programs: Array<IProgram>) => {
        this.programs = programs;
        this.config.selected_program_version = this.programs[this.config.selected_program].versions.length-1;
      },
      error: (error: any) => {
        console.log("E", error);
      }
    });
  }

  public selectProgram(program: number) {
    this.config.selected_program = program;
    this.config.selected_program_version = this.programs[this.config.selected_program].versions.length-1;
  }

  public versionChange(dir: string) {
    const len = this.programs[this.config.selected_program].versions.length-1;
    switch(dir) {
      case "left":
        this.config.selected_program_version = this.config.selected_program_version - 1;
        this.config.selected_program_version = this.config.selected_program_version < 0 ? 0 : this.config.selected_program_version;
        break;
      case "right":
        this.config.selected_program_version = this.config.selected_program_version + 1;
        this.config.selected_program_version = this.config.selected_program_version > len ? len : this.config.selected_program_version;
        break;
      default: break;
    }
  }

  public clickedMoreInfo() {
    this.electron.ipcRenderer.send("linkto", this.programs[this.config.selected_program].link);
  }
}