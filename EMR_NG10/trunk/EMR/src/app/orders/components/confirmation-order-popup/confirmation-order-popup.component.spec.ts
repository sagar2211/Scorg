import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationOrderPopupComponent } from './confirmation-order-popup.component';

describe('ConfirmationOrderPopupComponent', () => {
  let component: ConfirmationOrderPopupComponent;
  let fixture: ComponentFixture<ConfirmationOrderPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationOrderPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationOrderPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
