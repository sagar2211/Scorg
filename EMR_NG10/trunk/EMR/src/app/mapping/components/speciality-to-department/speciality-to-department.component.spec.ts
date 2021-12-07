import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialityToDepartmentComponent } from './speciality-to-department.component';

describe('SpecialityToDepartmentComponent', () => {
  let component: SpecialityToDepartmentComponent;
  let fixture: ComponentFixture<SpecialityToDepartmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialityToDepartmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialityToDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
