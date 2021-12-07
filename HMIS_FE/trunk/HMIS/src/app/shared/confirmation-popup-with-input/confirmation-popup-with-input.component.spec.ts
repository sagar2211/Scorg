import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationPopupWithInputComponent } from './confirmation-popup-with-input.component';

describe('ConfirmationPopupWithInputComponent', () => {
  let component: ConfirmationPopupWithInputComponent;
  let fixture: ComponentFixture<ConfirmationPopupWithInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmationPopupWithInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationPopupWithInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
