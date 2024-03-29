import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ElectronService } from 'ngx-electron-fresh';
import { IConfig } from '../data-structures';
import { SessionService } from '../session.service';
import { UploadComponent } from '../upload/upload.component';

@Component({
  selector: 'app-try-all-upload',
  templateUrl: './try-all-upload.component.html',
  styleUrls: ['./try-all-upload.component.css']
})
export class TryAllUploadComponent implements OnInit {
  @ViewChild('consoleText') console_text_ref!: ElementRef;
  public continued: boolean = false;
  public showWarning: boolean = true;
  public progress: string = "0%";
  public prog_val: number = 0;
  public console_text: string = "";
  public updateLoopRef: any;
  private configs_len: number = 1;
  private complete: boolean = false;
  constructor(public session: SessionService,
              private electron: ElectronService,
              private dialogRef: MatDialogRef<UploadComponent>) {
                this.dialogRef.beforeClosed().subscribe(() => {
                  clearInterval(this.updateLoopRef);
                  this.electron.ipcRenderer.removeAllListeners("upload-ret");
                });
              }

  ngOnInit(): void {
    // setTimeout(() => this.uploadAll(), 1000);

    this.updateLoopRef = setInterval(() => {
      this.console_text = this.console_text+"";
      this.prog_val = this.prog_val+0;
    }, 500);
  }

  public warningContinue() {
    this.continued = true;
    setTimeout(() => {
      this.showWarning = false;
      this.uploadAll();
    }, 1000);
  }

  public async uploadAll() {
    let configs: Array<IConfig> = [];
    const boards = this.session.firmware[this.session.config.selected_firmware].repo.getBoards();

    this.session.com_ports.forEach(port => {
      for (const name in this.session.boards) {
        let board = this.session.boards[name]
        if(boards.includes(name)) {
          if(board.processor_option){
            board.processors.forEach(processor => {
              configs.push({
                port: port.port,
                microcontroller: name,
                processor: processor,
                selected_firmware: this.session.config.selected_firmware,
                selected_firmware_version: this.session.config.selected_firmware_version
              });
            });
          }
          else {
            configs.push({
              port: port.port,
              microcontroller: name,
              processor: "",
              selected_firmware: this.session.config.selected_firmware,
              selected_firmware_version: this.session.config.selected_firmware_version
            });
          }
        }
      }
    });
    this.configs_len = configs.length;

    let i = 0;
    this.complete = false;
    while(!this.complete) {
      let txt = `${configs[i].port} : ${configs[i].microcontroller}`;
      if(this.session.boards[configs[i].microcontroller].processor_option)
        txt += ` : ${ configs[i].processor}`;
      this.consoleAppend(txt);

      await this.upload(configs[i++]).catch(() => {});
      this.electron.ipcRenderer.removeAllListeners("upload-ret");
      if(i >= configs.length) this.complete = true;
    }

    this.prog_val = 100;
    this.dialogRef.disableClose = false;
  }

  public upload(config: IConfig) {
    return new Promise((resolve, reject) => {
      const upload_conf = {
        port: config.port,
        microcontroller: config.microcontroller,
        processor: config.processor,
        url: this.session.firmware[config.selected_firmware].repo
           .releases[config.selected_firmware_version]
           .getURLByBoard(config.microcontroller),
      }
      this.electron.ipcRenderer.send("upload", upload_conf);
      this.electron.ipcRenderer.on("upload-ret", (event: any, data: string | {text: string, error: any}) => {
        let txt = (typeof data === "string") ? data : `${data.text} :: ${data.error}`;
        this.consoleAppend(txt)

        this.prog_val += (20 * (1/this.configs_len));

        if(txt.includes("Fail")) {
          return reject(txt);
        }

        if(txt.includes("SUCCESS")) {
          this.prog_val = 100;
          this.dialogRef.disableClose = false;
          this.complete = true;

          txt = `Successful Config: COM Port: ${config.port} :: Board: ${config.microcontroller} `;
          if(this.session.boards[config.microcontroller].processor_option)
            txt += `:: Processor: ${config.processor} `;
          this.consoleAppend(txt);


          // setTimeout(() => this.dialogRef.close(), 4000);
          resolve("OK");
        }
      });
    });
  }

  public update(text: any) {
    this.electron.ipcRenderer.send("copy-text", text);
  }

  public copy() {
    window.navigator.clipboard.writeText(this.console_text.replaceAll("<br />", "\n"));
  }

  private consoleAppend(text: string){
    this.console_text += `> ${text} <br />`;
    console.log(this.console_text_ref.nativeElement.scrollHeight);
    setTimeout(() => this.console_text_ref.nativeElement.scrollTop = this.console_text_ref.nativeElement.scrollHeight , 300);
  }
}
