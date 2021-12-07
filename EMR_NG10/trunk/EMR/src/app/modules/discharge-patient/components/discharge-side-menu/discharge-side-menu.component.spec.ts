import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargeSideMenuComponent } from './discharge-side-menu.component';

describe('DischargeSideMenuComponent', () => {
  let component: DischargeSideMenuComponent;
  let fixture: ComponentFixture<DischargeSideMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DischargeSideMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DischargeSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
