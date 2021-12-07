import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityRoomHomeComponent } from './entity-room-home.component';

describe('EntityRoomHomeComponent', () => {
  let component: EntityRoomHomeComponent;
  let fixture: ComponentFixture<EntityRoomHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityRoomHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityRoomHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
