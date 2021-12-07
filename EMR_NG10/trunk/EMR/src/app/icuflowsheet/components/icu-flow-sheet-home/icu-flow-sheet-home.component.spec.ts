import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcuFlowSheetHomeComponent } from './icu-flow-sheet-home.component';

describe('IcuFlowSheetHomeComponent', () => {
  let component: IcuFlowSheetHomeComponent;
  let fixture: ComponentFixture<IcuFlowSheetHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcuFlowSheetHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcuFlowSheetHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
