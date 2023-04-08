import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { FormsModule } from '@angular/forms';
import { FirmwareSelectorComponent } from './firmware-selector/firmware-selector.component';
import { SessionService } from './session.service';
import { NgxElectronModule } from 'ngx-electron-fresh';
import { UploadComponent } from './upload/upload.component';
import { TryAllUploadComponent } from './try-all-upload/try-all-upload.component';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    FirmwareSelectorComponent,
    UploadComponent,
    TryAllUploadComponent

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    NgxElectronModule,
    HttpClientModule,
  ],
  providers: [SessionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
