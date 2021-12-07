import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcuVitalSheetComponent } from './icu-vital-sheet.component';

describe('IcuVitalSheetComponent', () => {
  let component: IcuVitalSheetComponent;
  let fixture: ComponentFixture<IcuVitalSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcuVitalSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcuVitalSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
