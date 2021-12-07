import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcuCurrentMedicationsComponent } from './icu-current-medications.component';

describe('IcuCurrentMedicationsComponent', () => {
  let component: IcuCurrentMedicationsComponent;
  let fixture: ComponentFixture<IcuCurrentMedicationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcuCurrentMedicationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcuCurrentMedicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
