import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFilesPopupComponent } from './dashboard-files-popup.component';

describe('DashboardFilesPopupComponent', () => {
  let component: DashboardFilesPopupComponent;
  let fixture: ComponentFixture<DashboardFilesPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardFilesPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardFilesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
