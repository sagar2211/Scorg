import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpPatientComponent } from './ip-patient.component';

describe('IpPatientComponent', () => {
  let component: IpPatientComponent;
  let fixture: ComponentFixture<IpPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IpPatientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IpPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
