import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcuVitalSheetCcuComponent } from './icu-vital-sheet-ccu.component';

describe('IcuVitalSheetComponent', () => {
  let component: IcuVitalSheetCcuComponent;
  let fixture: ComponentFixture<IcuVitalSheetCcuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcuVitalSheetCcuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcuVitalSheetCcuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
