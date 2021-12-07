import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartLatestHistoryComponent } from './chart-latest-history.component';

describe('ChartLatestHistoryComponent', () => {
  let component: ChartLatestHistoryComponent;
  let fixture: ComponentFixture<ChartLatestHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartLatestHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartLatestHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
