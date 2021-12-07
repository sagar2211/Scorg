import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreConsumptionSummaryComponent } from './store-consumption-summary.component';

describe('StoreConsumptionSummaryComponent', () => {
  let component: StoreConsumptionSummaryComponent;
  let fixture: ComponentFixture<StoreConsumptionSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoreConsumptionSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreConsumptionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
