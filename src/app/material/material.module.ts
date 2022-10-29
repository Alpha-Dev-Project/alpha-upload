import { NgModule } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import {MatDividerModule} from '@angular/material/divider';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressBarModule} from '@angular/material/progress-bar';




const MaterialComponents = [
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatTooltipModule,
  MatSelectModule,
  MatDividerModule,
  MatDialogModule,
  MatProgressBarModule
];

@NgModule({
  declarations: [],
  imports: [
  ],
  exports: [
    MaterialComponents,
  ],
})
export class MaterialModule { }
