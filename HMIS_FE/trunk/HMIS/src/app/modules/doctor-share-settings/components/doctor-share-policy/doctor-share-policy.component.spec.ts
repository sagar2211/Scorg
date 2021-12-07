import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorSharePolicyComponent } from './doctor-share-policy.component';

describe('DoctorSharePolicyComponent', () => {
  let component: DoctorSharePolicyComponent;
  let fixture: ComponentFixture<DoctorSharePolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorSharePolicyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorSharePolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
