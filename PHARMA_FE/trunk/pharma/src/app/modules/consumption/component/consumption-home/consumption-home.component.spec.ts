import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumptionHomeComponent } from './consumption-home.component';

describe('ConsumptionHomeComponent', () => {
  let component: ConsumptionHomeComponent;
  let fixture: ComponentFixture<ConsumptionHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumptionHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumptionHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
