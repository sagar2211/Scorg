import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayFieldSettingsComponent } from './display-field-settings.component';

describe('DisplayFieldSettingsComponent', () => {
  let component: DisplayFieldSettingsComponent;
  let fixture: ComponentFixture<DisplayFieldSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayFieldSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayFieldSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
