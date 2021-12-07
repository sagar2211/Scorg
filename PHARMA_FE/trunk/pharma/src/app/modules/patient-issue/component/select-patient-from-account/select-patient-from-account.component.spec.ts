import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPatientFromAccountComponent } from './select-patient-from-account.component';

describe('SelectPatientFromAccountComponent', () => {
  let component: SelectPatientFromAccountComponent;
  let fixture: ComponentFixture<SelectPatientFromAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectPatientFromAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectPatientFromAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
