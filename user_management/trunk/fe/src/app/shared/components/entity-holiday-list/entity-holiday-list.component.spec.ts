import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityHolidayListComponent } from './entity-holiday-list.component';

describe('EntityHolidayListComponent', () => {
  let component: EntityHolidayListComponent;
  let fixture: ComponentFixture<EntityHolidayListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityHolidayListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityHolidayListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
