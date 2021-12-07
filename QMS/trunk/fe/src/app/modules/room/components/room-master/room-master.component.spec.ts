import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomMasterComponent } from './room-master.component';

describe('RoomMasterComponent', () => {
  let component: RoomMasterComponent;
  let fixture: ComponentFixture<RoomMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
