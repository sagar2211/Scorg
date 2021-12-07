import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelHolidayPopupComponent } from './cancel-holiday-popup.component';

describe('CancelHolidayPopupComponent', () => {
  let component: CancelHolidayPopupComponent;
  let fixture: ComponentFixture<CancelHolidayPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelHolidayPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelHolidayPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
