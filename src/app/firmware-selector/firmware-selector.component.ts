import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Output, EventEmitter } from '@angular/core';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-firmware-selector',
  templateUrl: './firmware-selector.component.html',
  styleUrls: ['./firmware-selector.component.css']
})
export class FirmwareSelectorComponent implements OnInit {
  @Input('expand') expand_obsvble!: Observable<string>;
  @Output() SelectedEvent = new EventEmitter<number>();
  public show_short_form: boolean = true;
  public show_long_form: boolean = false;
  public short_form_classes: any = {};
  public long_form_classes: any = {};

  constructor(public session: SessionService) {}

  ngOnInit(): void {
    this.expand_obsvble.subscribe((state: string) => this.switch(state));
  }

  public switch(state: string) {
    if(state === 'long') {
      this.short_form_classes = {
        show: false,
        hide: true,
      }

      setTimeout(() => {
        this.long_form_classes = {
          show: true,
          hide: false,
        }
        this.show_short_form = false;
        this.show_long_form = true;
      }, 400);
    }
    if(state === 'short') {
      this.long_form_classes = {
        show: false,
        hide: true,
      }

      setTimeout(() => {
        this.short_form_classes = {
          show: true,
          hide: false,
        }
        this.show_long_form = false;
        this.show_short_form = true;
      }, 400);
    }
  }

  public firmwareSelected(index: number) {
    this.session.selectFirmware(index);
    this.switch('short');
    this.SelectedEvent.emit();
  }

  public getSelectedFirmwareVersionString() {
    return "V1.0.0"
  }
}
