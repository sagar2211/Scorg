import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmrSettingSideMenuComponent } from './emr-setting-side-menu.component';

describe('EmrSettingSideMenuComponent', () => {
  let component: EmrSettingSideMenuComponent;
  let fixture: ComponentFixture<EmrSettingSideMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmrSettingSideMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmrSettingSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
