import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomSectionHomeComponent } from './room-section-home.component';

describe('RoomSectionHomeComponent', () => {
  let component: RoomSectionHomeComponent;
  let fixture: ComponentFixture<RoomSectionHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomSectionHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomSectionHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
