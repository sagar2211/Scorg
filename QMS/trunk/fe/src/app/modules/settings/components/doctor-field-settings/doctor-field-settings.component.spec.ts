import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorFieldSettingsComponent } from './doctor-field-settings.component';

describe('DoctorFieldSettingsComponent', () => {
  let component: DoctorFieldSettingsComponent;
  let fixture: ComponentFixture<DoctorFieldSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoctorFieldSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorFieldSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
