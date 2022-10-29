import { Component } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { boards, BoardsNames } from './com-devices-data';
import { SessionService } from './session.service';
import { ElectronService } from 'ngx-electron';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { UploadComponent } from './upload/upload.component';
import { TryAllUploadComponent } from './try-all-upload/try-all-upload.component';
 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'alpha-upload';
  public expand_obsvble!: Observable<string>;
  public expand_obsrvr!: Observer<string>;
  public expand: boolean = false;
  public boards = boards;

  constructor(public session: SessionService,
              private electron: ElectronService,
              public dialog: MatDialog) {
    this.expand_obsvble = new Observable(observer => {
      this.expand_obsrvr = observer;
    });
  }

  ngOnInit(): void {
  }

  public expandProgramSelector() {
    this.expand = !this.expand;
    this.expand_obsrvr.next(this.expand ? 'long' : 'short');
  }

  public programSelected() {
    this.expand = false;
  }

  private getBoardIndex(board: string) {
    const bn = board.toLowerCase().replaceAll(' ', '-') as BoardsNames;
    return boards.map(e => e.name).indexOf(bn);
  }

  public checkProcessorOptionAvailable() {
    const index = this.getBoardIndex(this.session.config.microcontroller);
    if(index == -1) return false;
    return boards[index].processor_option
  }

  public getProcessorsList() {
    const index = this.getBoardIndex(this.session.config.microcontroller);
    if(index == -1) return [];
    return boards[index].processors;
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
