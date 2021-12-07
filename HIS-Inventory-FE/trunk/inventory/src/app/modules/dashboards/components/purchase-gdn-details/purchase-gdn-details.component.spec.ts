import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseGdnDetailsComponent } from './purchase-gdn-details.component';

describe('PurchaseGdnDetailsComponent', () => {
  let component: PurchaseGdnDetailsComponent;
  let fixture: ComponentFixture<PurchaseGdnDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseGdnDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseGdnDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
