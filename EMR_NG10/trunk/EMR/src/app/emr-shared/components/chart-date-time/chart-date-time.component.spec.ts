import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartDateTimeComponent } from './chart-date-time.component';

describe('ChartDateTimeComponent', () => {
  let component: ChartDateTimeComponent;
  let fixture: ComponentFixture<ChartDateTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartDateTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartDateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
