import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeathPatientListComponent } from './death-patient-list.component';

describe('DeathPatientListComponent', () => {
  let component: DeathPatientListComponent;
  let fixture: ComponentFixture<DeathPatientListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeathPatientListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeathPatientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
