import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgMapPrintComponent } from './svg-map-print.component';

describe('SvgMapPrintComponent', () => {
  let component: SvgMapPrintComponent;
  let fixture: ComponentFixture<SvgMapPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SvgMapPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgMapPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
