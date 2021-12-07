import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionRoomDoctorMappingComponent } from './section-room-doctor-mapping.component';

describe('SectionRoomDoctorMappingComponent', () => {
  let component: SectionRoomDoctorMappingComponent;
  let fixture: ComponentFixture<SectionRoomDoctorMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SectionRoomDoctorMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionRoomDoctorMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
