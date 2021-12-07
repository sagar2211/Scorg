import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QlistSearchComponent } from './qlist-search.component';

describe('QlistSearchComponent', () => {
  let component: QlistSearchComponent;
  let fixture: ComponentFixture<QlistSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QlistSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QlistSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
