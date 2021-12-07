import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QmsHomeComponent } from './qms-home.component';

describe('QmsHomeComponent', () => {
  let component: QmsHomeComponent;
  let fixture: ComponentFixture<QmsHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QmsHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QmsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
