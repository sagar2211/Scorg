import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControlSettingComponent } from './form-control-setting.component';

describe('FormControlSettingComponent', () => {
  let component: FormControlSettingComponent;
  let fixture: ComponentFixture<FormControlSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormControlSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormControlSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
