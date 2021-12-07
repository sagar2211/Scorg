import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtRoomMasterComponent } from './ot-room-master.component';

describe('OtRoomMasterComponent', () => {
  let component: OtRoomMasterComponent;
  let fixture: ComponentFixture<OtRoomMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtRoomMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtRoomMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
