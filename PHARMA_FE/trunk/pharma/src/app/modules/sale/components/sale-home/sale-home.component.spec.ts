import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleHomeComponent } from './sale-home.component';

describe('SaleHomeComponent', () => {
  let component: SaleHomeComponent;
  let fixture: ComponentFixture<SaleHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaleHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
