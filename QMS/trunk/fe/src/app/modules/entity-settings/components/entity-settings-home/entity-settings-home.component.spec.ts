import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitySettingsHomeComponent } from './entity-settings-home.component';

describe('EntitySettingsHomeComponent', () => {
  let component: EntitySettingsHomeComponent;
  let fixture: ComponentFixture<EntitySettingsHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntitySettingsHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitySettingsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
