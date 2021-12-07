import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoNursingStationComponent } from './no-nursing-station.component';

describe('NoNursingStationComponent', () => {
  let component: NoNursingStationComponent;
  let fixture: ComponentFixture<NoNursingStationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoNursingStationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoNursingStationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
