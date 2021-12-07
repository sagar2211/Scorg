import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NursingBedDisplayHomeComponent } from './nursing-bed-display-home.component';

describe('NursingBedDisplayHomeComponent', () => {
  let component: NursingBedDisplayHomeComponent;
  let fixture: ComponentFixture<NursingBedDisplayHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NursingBedDisplayHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NursingBedDisplayHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
