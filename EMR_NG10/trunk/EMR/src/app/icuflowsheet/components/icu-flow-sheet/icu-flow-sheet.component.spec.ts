import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcuFlowSheetComponent } from './icu-flow-sheet.component';

describe('IcuFlowSheetComponent', () => {
  let component: IcuFlowSheetComponent;
  let fixture: ComponentFixture<IcuFlowSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcuFlowSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcuFlowSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
