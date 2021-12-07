import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorShareSettingHomeComponent } from './doctor-share-setting-home.component';

describe('DoctorShareSettingHomeComponent', () => {
  let component: DoctorShareSettingHomeComponent;
  let fixture: ComponentFixture<DoctorShareSettingHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorShareSettingHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorShareSettingHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
