import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PupilSizeScaleComponent } from './pupil-size-scale.component';

describe('PupilSizeScaleComponent', () => {
  let component: PupilSizeScaleComponent;
  let fixture: ComponentFixture<PupilSizeScaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PupilSizeScaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PupilSizeScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
