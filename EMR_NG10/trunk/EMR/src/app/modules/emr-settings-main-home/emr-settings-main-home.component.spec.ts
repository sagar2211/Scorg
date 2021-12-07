import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmrSettingsMainHomeComponent } from './emr-settings-main-home.component';

describe('EmrSettingsMainHomeComponent', () => {
  let component: EmrSettingsMainHomeComponent;
  let fixture: ComponentFixture<EmrSettingsMainHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmrSettingsMainHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmrSettingsMainHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
