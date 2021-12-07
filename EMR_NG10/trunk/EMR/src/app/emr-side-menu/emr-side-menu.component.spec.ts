import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmrSideMenuComponent } from './emr-side-menu.component';

describe('EmrSideMenuComponent', () => {
  let component: EmrSideMenuComponent;
  let fixture: ComponentFixture<EmrSideMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmrSideMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmrSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
