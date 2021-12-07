import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarMedicineDetailsComponent } from './mar-medicine-details.component';

describe('MarMedicineDetailsComponent', () => {
  let component: MarMedicineDetailsComponent;
  let fixture: ComponentFixture<MarMedicineDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarMedicineDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarMedicineDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
