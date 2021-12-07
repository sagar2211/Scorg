import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcuDiagnosisComponent } from './icu-diagnosis.component';

describe('IcuDiagnosisComponent', () => {
  let component: IcuDiagnosisComponent;
  let fixture: ComponentFixture<IcuDiagnosisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcuDiagnosisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcuDiagnosisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
