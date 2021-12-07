import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreConsumptionComponent } from './store-consumption.component';

describe('StoreConsumptionComponent', () => {
  let component: StoreConsumptionComponent;
  let fixture: ComponentFixture<StoreConsumptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoreConsumptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
