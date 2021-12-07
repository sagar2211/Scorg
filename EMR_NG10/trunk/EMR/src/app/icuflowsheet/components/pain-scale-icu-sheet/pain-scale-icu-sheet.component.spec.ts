import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PainScaleIcuSheetComponent } from './pain-scale-icu-sheet.component';

describe('PainScaleIcuSheetComponent', () => {
  let component: PainScaleIcuSheetComponent;
  let fixture: ComponentFixture<PainScaleIcuSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PainScaleIcuSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PainScaleIcuSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
