import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumptionSummaryHomeComponent } from './consumption-summary-home.component';

describe('ConsumptionSummaryHomeComponent', () => {
  let component: ConsumptionSummaryHomeComponent;
  let fixture: ComponentFixture<ConsumptionSummaryHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumptionSummaryHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumptionSummaryHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
