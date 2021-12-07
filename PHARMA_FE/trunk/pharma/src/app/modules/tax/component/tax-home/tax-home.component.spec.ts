import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxHomeComponent } from './tax-home.component';

describe('TaxHomeComponent', () => {
  let component: TaxHomeComponent;
  let fixture: ComponentFixture<TaxHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
