import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ElectronService } from 'ngx-electron-fresh';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  public progress: string = "0%";
  public prog_val: number = 0;
  public console_text: string = "";
  public updateLoopRef: any;
  constructor(public session: SessionService,
              private electron: ElectronService,
              private dialogRef: MatDialogRef<UploadComponent>) {
                this.dialogRef.beforeClosed().subscribe(() => {
                  clearInterval(this.updateLoopRef);
                  this.electron.ipcRenderer.removeAllListeners("upload-ret");
                });
              }

  ngOnInit(): void {
    setTimeout(() => this.upload(), 1000);

    this.updateLoopRef = setInterval(() => {
      this.console_text = this.console_text+"";
      this.prog_val = this.prog_val+0;
    }, 500);
  }

  public upload() {
    const upload_conf = {
      port: this.session.config.port,
      microcontroller: this.session.config.microcontroller,
      processor: this.session.config.processor,
      selected_program: this.session.programs[this.session.config.selected_program],
      selected_program_version: this.session.config.selected_program_version,
    }
    this.electron.ipcRenderer.send("upload", upload_conf);
    this.electron.ipcRenderer.on("upload-ret", (event: any, data: string | {text: string, error: any}) => {
      const text = (typeof data === "string") ? data : `${data.text} :: ${data.error}`;
      this.console_text += `> ${text}<br />`;

      if(!text.includes("Fail")) this.prog_val += 25;
      else this.prog_val = 100;
      if(this.prog_val >= 95) this.dialogRef.disableClose = false;

      if(text.includes("SUCCESS")) setTimeout(() => this.dialogRef.close(), 4000);
    });
  }

  public update(text: any) {
    this.electron.ipcRenderer.send("copy-text", text);
  }

  public copy() {
    window.navigator.clipboard.writeText(this.console_text.replaceAll("<br />", "\n"));
  }
}