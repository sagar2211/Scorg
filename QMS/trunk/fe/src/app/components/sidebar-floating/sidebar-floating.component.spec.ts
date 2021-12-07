import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarFloatingComponent } from './sidebar-floating.component';

describe('SidebarFloatingComponent', () => {
  let component: SidebarFloatingComponent;
  let fixture: ComponentFixture<SidebarFloatingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarFloatingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarFloatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
