import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TryAllUploadComponent } from './try-all-upload.component';

describe('TryAllUploadComponent', () => {
  let component: TryAllUploadComponent;
  let fixture: ComponentFixture<TryAllUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TryAllUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TryAllUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
