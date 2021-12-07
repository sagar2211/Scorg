import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QlistFilterComponent } from './qlist-filter.component';

describe('QlistFilterComponent', () => {
  let component: QlistFilterComponent;
  let fixture: ComponentFixture<QlistFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QlistFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QlistFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
