import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentToWardComponent } from './department-to-ward.component';

describe('DepartmentToWardComponent', () => {
  let component: DepartmentToWardComponent;
  let fixture: ComponentFixture<DepartmentToWardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepartmentToWardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentToWardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
