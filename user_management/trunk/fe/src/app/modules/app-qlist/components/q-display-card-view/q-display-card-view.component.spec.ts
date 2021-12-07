import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QDisplayCardViewComponent } from './q-display-card-view.component';

describe('QDisplayCardViewComponent', () => {
  let component: QDisplayCardViewComponent;
  let fixture: ComponentFixture<QDisplayCardViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QDisplayCardViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QDisplayCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
