import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityHolidaySettingComponent } from './entity-holiday-setting.component';

describe('EntityHolidaySettingComponent', () => {
  let component: EntityHolidaySettingComponent;
  let fixture: ComponentFixture<EntityHolidaySettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityHolidaySettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityHolidaySettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
