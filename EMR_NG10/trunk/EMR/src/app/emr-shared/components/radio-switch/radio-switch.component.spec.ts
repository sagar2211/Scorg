import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioSwitchComponent } from './radio-switch.component';

describe('RadioSwitchComponent', () => {
  let component: RadioSwitchComponent;
  let fixture: ComponentFixture<RadioSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadioSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
