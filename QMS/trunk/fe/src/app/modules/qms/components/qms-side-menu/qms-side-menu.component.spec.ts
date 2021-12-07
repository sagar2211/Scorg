import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QmsSideMenuComponent } from './qms-side-menu.component';

describe('QmsSideMenuComponent', () => {
  let component: QmsSideMenuComponent;
  let fixture: ComponentFixture<QmsSideMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QmsSideMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QmsSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
