import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallingConfirmComponent } from './calling-confirm.component';

describe('CallingConfirmComponent', () => {
  let component: CallingConfirmComponent;
  let fixture: ComponentFixture<CallingConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallingConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallingConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
