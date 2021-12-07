import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkFilterComponent } from './bulk-filter.component';

describe('BulkFilterComponent', () => {
  let component: BulkFilterComponent;
  let fixture: ComponentFixture<BulkFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
