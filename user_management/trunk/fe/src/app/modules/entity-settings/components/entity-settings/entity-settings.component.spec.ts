import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitySettingsComponent } from './entity-settings.component';

describe('EntitySettingsComponent', () => {
  let component: EntitySettingsComponent;
  let fixture: ComponentFixture<EntitySettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntitySettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
