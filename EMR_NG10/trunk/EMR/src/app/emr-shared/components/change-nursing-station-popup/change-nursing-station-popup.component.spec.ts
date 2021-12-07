import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeNursingStationPopupComponent } from './change-nursing-station-popup.component';

describe('ChangeNursingStationPopupComponent', () => {
  let component: ChangeNursingStationPopupComponent;
  let fixture: ComponentFixture<ChangeNursingStationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeNursingStationPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeNursingStationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
