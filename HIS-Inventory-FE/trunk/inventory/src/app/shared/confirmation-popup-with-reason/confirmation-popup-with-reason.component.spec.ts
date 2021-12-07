import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationPopupWithReasonComponent } from './confirmation-popup-with-reason.component';

describe('ConfirmationPopupWithReasonComponent', () => {
  let component: ConfirmationPopupWithReasonComponent;
  let fixture: ComponentFixture<ConfirmationPopupWithReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmationPopupWithReasonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationPopupWithReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
