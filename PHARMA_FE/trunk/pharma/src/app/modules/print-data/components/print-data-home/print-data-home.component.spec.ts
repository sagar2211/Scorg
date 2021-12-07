import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintDataHomeComponent } from './print-data-home.component';

describe('PrintDataHomeComponent', () => {
  let component: PrintDataHomeComponent;
  let fixture: ComponentFixture<PrintDataHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintDataHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintDataHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
