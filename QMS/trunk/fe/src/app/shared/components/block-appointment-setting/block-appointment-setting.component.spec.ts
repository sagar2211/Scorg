import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockAppointmentSettingComponent } from './block-appointment-setting.component';

describe('BlockAppointmentSettingComponent', () => {
  let component: BlockAppointmentSettingComponent;
  let fixture: ComponentFixture<BlockAppointmentSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockAppointmentSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockAppointmentSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
