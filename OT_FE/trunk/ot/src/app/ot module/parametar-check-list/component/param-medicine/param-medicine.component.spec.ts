import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamMedicineComponent } from './param-medicine.component';

describe('ParamMedicineComponent', () => {
  let component: ParamMedicineComponent;
  let fixture: ComponentFixture<ParamMedicineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParamMedicineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParamMedicineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
