import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BslValuesComponent } from './bsl-values.component';

describe('BslValuesComponent', () => {
  let component: BslValuesComponent;
  let fixture: ComponentFixture<BslValuesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BslValuesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BslValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
