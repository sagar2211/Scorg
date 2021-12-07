import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcuHandoverLogParamsComponent } from './icu-handover-log-params.component';

describe('IcuHandoverLogParamsComponent', () => {
  let component: IcuHandoverLogParamsComponent;
  let fixture: ComponentFixture<IcuHandoverLogParamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcuHandoverLogParamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcuHandoverLogParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
