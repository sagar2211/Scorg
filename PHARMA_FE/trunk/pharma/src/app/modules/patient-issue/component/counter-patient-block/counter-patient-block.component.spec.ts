import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterPatientBlockComponent } from './counter-patient-block.component';

describe('CounterPatientBlockComponent', () => {
  let component: CounterPatientBlockComponent;
  let fixture: ComponentFixture<CounterPatientBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CounterPatientBlockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterPatientBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
