import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitiRoomMapComponent } from './entity-room-map.component';

describe('EntitiRoomMapComponent', () => {
  let component: EntitiRoomMapComponent;
  let fixture: ComponentFixture<EntitiRoomMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntitiRoomMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitiRoomMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
