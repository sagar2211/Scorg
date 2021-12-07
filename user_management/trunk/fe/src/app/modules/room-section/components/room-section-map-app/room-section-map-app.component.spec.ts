import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomSectionMapAppComponent } from './room-section-map-app.component';

describe('RoomSectionMapAppComponent', () => {
  let component: RoomSectionMapAppComponent;
  let fixture: ComponentFixture<RoomSectionMapAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomSectionMapAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomSectionMapAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
