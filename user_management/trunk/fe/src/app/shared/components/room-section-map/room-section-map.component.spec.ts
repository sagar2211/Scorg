import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomSectionMapComponent } from './room-section-map.component';

describe('RoomSectionMapComponent', () => {
  let component: RoomSectionMapComponent;
  let fixture: ComponentFixture<RoomSectionMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomSectionMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomSectionMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
