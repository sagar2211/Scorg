import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpPatientComponent } from './op-patient.component';

describe('OpPatientComponent', () => {
  let component: OpPatientComponent;
  let fixture: ComponentFixture<OpPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpPatientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
