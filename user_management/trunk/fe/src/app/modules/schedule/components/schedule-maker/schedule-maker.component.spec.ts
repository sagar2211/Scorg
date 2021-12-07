import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleMakerComponent } from './schedule-maker.component';

describe('ScheduleMakerComponent', () => {
  let component: ScheduleMakerComponent;
  let fixture: ComponentFixture<ScheduleMakerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleMakerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
