import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtRoomMasterListComponent } from './ot-room-master-list.component';

describe('OtRoomMasterListComponent', () => {
  let component: OtRoomMasterListComponent;
  let fixture: ComponentFixture<OtRoomMasterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtRoomMasterListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtRoomMasterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
