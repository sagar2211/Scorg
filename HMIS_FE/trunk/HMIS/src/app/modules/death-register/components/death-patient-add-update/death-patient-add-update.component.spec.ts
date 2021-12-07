import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeathPatientAddUpdateComponent } from './death-patient-add-update.component';

describe('DeathPatientAddUpdateComponent', () => {
  let component: DeathPatientAddUpdateComponent;
  let fixture: ComponentFixture<DeathPatientAddUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeathPatientAddUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeathPatientAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
