import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveSchedulesGridComponent } from './active-schedules-grid.component';

describe('ActiveSchedulesGridComponent', () => {
  let component: ActiveSchedulesGridComponent;
  let fixture: ComponentFixture<ActiveSchedulesGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveSchedulesGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveSchedulesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
