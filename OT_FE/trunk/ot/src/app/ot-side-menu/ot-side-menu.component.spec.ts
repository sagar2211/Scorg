import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtSideMenuComponent } from './ot-side-menu.component';

describe('OtSideMenuComponent', () => {
  let component: OtSideMenuComponent;
  let fixture: ComponentFixture<OtSideMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtSideMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
