import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmrSettingHomeComponent } from './emr-setting-home.component';

describe('EmrSettingHomeComponent', () => {
  let component: EmrSettingHomeComponent;
  let fixture: ComponentFixture<EmrSettingHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmrSettingHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmrSettingHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
