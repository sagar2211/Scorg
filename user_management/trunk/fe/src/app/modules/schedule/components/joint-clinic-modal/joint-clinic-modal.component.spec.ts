import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JointClinicModalComponent } from './joint-clinic-modal.component';

describe('JointClinicModalComponent', () => {
  let component: JointClinicModalComponent;
  let fixture: ComponentFixture<JointClinicModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JointClinicModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JointClinicModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
