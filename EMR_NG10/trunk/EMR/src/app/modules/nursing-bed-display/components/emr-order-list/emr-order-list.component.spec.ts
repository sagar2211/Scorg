import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmrOrderListComponent } from './emr-order-list.component';

describe('EmrOrderListComponent', () => {
  let component: EmrOrderListComponent;
  let fixture: ComponentFixture<EmrOrderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmrOrderListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmrOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
