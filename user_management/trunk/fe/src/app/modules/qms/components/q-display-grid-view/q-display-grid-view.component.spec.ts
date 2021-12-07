import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QDisplayGridViewComponent } from './q-display-grid-view.component';

describe('QDisplayGridViewComponent', () => {
  let component: QDisplayGridViewComponent;
  let fixture: ComponentFixture<QDisplayGridViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QDisplayGridViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QDisplayGridViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
