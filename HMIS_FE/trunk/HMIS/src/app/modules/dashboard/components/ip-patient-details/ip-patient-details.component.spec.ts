import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpPatientDetailsComponent } from './ip-patient-details.component';

describe('IpPatientDetailsComponent', () => {
  let component: IpPatientDetailsComponent;
  let fixture: ComponentFixture<IpPatientDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IpPatientDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IpPatientDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
