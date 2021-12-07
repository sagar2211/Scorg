import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityRoomMapListComponent } from './entity-room-map-list.component';

describe('EntityRoomMapListComponent', () => {
  let component: EntityRoomMapListComponent;
  let fixture: ComponentFixture<EntityRoomMapListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityRoomMapListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityRoomMapListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
