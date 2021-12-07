import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeDropDownComponent } from './time-drop-down.component';

describe('TimeDropDownComponent', () => {
  let component: TimeDropDownComponent;
  let fixture: ComponentFixture<TimeDropDownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeDropDownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
