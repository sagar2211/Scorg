import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotColorSettingComponent } from './slot-color-setting.component';

describe('SlotColorSettingComponent', () => {
  let component: SlotColorSettingComponent;
  let fixture: ComponentFixture<SlotColorSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlotColorSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlotColorSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
