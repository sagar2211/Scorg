import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedOccupancyComponent } from './bed-occupancy.component';

describe('BedOccupancyComponent', () => {
  let component: BedOccupancyComponent;
  let fixture: ComponentFixture<BedOccupancyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BedOccupancyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BedOccupancyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
