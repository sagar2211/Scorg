import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserToNursingStationListComponent } from './user-to-nursing-station-list.component';

describe('UserToNursingStationListComponent', () => {
  let component: UserToNursingStationListComponent;
  let fixture: ComponentFixture<UserToNursingStationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserToNursingStationListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserToNursingStationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
