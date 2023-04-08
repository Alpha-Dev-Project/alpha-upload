import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmwareSelectorComponent } from './firmware-selector.component';

describe('FirmwareSelectorComponent', () => {
  let component: FirmwareSelectorComponent;
  let fixture: ComponentFixture<FirmwareSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FirmwareSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirmwareSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
