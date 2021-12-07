import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOpdSlotSdGraphComponent } from './admin-opd-slot-sd-graph.component';

describe('AdminOpdSlotSdGraphComponent', () => {
  let component: AdminOpdSlotSdGraphComponent;
  let fixture: ComponentFixture<AdminOpdSlotSdGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminOpdSlotSdGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminOpdSlotSdGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
