import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSaleComponent } from './all-sale.component';

describe('AllSaleComponent', () => {
  let component: AllSaleComponent;
  let fixture: ComponentFixture<AllSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllSaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
