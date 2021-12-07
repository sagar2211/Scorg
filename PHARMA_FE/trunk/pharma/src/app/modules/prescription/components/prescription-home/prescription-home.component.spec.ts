import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionHomeComponent } from './prescription-home.component';

describe('PrescriptionHomeComponent', () => {
  let component: PrescriptionHomeComponent;
  let fixture: ComponentFixture<PrescriptionHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescriptionHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
