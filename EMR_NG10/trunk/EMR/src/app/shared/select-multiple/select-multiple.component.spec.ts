import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomMultipleComponent } from './room-multiple.component';

describe('RoomMultipleComponent', () => {
  let component: RoomMultipleComponent;
  let fixture: ComponentFixture<RoomMultipleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomMultipleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
