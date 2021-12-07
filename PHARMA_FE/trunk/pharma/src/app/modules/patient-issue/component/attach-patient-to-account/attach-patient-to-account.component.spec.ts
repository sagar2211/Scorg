import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachPatientToAccountComponent } from './attach-patient-to-account.component';

describe('AttachPatientToAccountComponent', () => {
  let component: AttachPatientToAccountComponent;
  let fixture: ComponentFixture<AttachPatientToAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttachPatientToAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachPatientToAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
