import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkCancelationComponent } from './bulk-cancelation.component';

describe('BulkCancelationComponent', () => {
  let component: BulkCancelationComponent;
  let fixture: ComponentFixture<BulkCancelationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkCancelationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkCancelationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
