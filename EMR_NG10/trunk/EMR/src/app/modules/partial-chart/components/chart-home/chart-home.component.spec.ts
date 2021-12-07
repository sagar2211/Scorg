import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartHomeComponent } from './chart-home.component';

describe('ChartHomeComponent', () => {
  let component: ChartHomeComponent;
  let fixture: ComponentFixture<ChartHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
