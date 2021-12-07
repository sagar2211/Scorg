import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QDisplayCardDetailsComponent } from './q-display-card-details.component';

describe('QDisplayCardDetailsComponent', () => {
  let component: QDisplayCardDetailsComponent;
  let fixture: ComponentFixture<QDisplayCardDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QDisplayCardDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QDisplayCardDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
