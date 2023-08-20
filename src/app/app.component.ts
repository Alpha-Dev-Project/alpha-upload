import { Component, OnInit } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { ElectronService } from 'ngx-electron-fresh';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { boards } from './com-devices-data';
import { SessionService } from './session.service';
import { UploadComponent } from './upload/upload.component';
import { TryAllUploadComponent } from './try-all-upload/try-all-upload.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'alpha-upload';
  public expand_obsvble!: Observable<string>;
  public expand_obsrvr!: Observer<string>;
  public expand: boolean = false;
  public boards = boards;
  public version!: string;

  constructor(public session: SessionService,
              private electron: ElectronService,
              public dialog: MatDialog) {
    this.expand_obsvble = new Observable(observer => {
      this.expand_obsrvr = observer;
    });

    this.version = this.electron.ipcRenderer.sendSync('version')
  }

  ngOnInit(): void {}

  public expandFirmwareSelector() {
    this.expand = !this.expand;
    this.expand_obsrvr.next(this.expand ? 'long' : 'short');
  }

  public firmwareSelected() {
    this.expand = false;
  }

  public getPrettyName(board: string) {
    return boards[board].pretty_name
  }

  public checkProcessorOptionAvailable() {
    return boards[this.session.config.microcontroller].processor_option
  }

  public getProcessorsList() {
    return boards[this.session.config.microcontroller].processors;
  }

  public upload() {
    const dialogRef = this.dialog.open(UploadComponent, {
      width: '500px',
      height: '250px',
      disableClose: true,
      panelClass: 'app-full-bleed-dialog',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  public tryAll() {
    const dialogRef = this.dialog.open(TryAllUploadComponent, {
      width: '500px',
      height: '250px',
      disableClose: true,
      panelClass: 'app-full-bleed-dialog',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  public minimise() {
    this.electron.ipcRenderer.send("min");
  }

  public close() {
    this.electron.ipcRenderer.send("close");
  }
}
