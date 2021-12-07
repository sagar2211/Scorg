import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineInputsComponent } from './medicine-inputs.component';

describe('MedicineInputsComponent', () => {
  let component: MedicineInputsComponent;
  let fixture: ComponentFixture<MedicineInputsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedicineInputsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicineInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
