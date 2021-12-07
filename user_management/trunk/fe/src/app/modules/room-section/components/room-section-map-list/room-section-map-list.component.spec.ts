import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomSectionMapListComponent } from './room-section-map-list.component';

describe('RoomSectionMapListComponent', () => {
  let component: RoomSectionMapListComponent;
  let fixture: ComponentFixture<RoomSectionMapListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomSectionMapListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomSectionMapListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
