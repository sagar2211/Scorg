import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalRevenueDetailsComponent } from './total-revenue-details.component';

describe('TotalRevenueDetailsComponent', () => {
  let component: TotalRevenueDetailsComponent;
  let fixture: ComponentFixture<TotalRevenueDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalRevenueDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalRevenueDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
