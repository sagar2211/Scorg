import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsMenusComponent } from './settings-menus.component';

describe('SettingsMenusComponent', () => {
  let component: SettingsMenusComponent;
  let fixture: ComponentFixture<SettingsMenusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsMenusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsMenusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
