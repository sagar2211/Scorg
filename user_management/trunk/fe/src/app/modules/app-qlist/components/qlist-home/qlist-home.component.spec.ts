import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QlistHomeComponent } from './qlist-home.component';

describe('QlistHomeComponent', () => {
  let component: QlistHomeComponent;
  let fixture: ComponentFixture<QlistHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QlistHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QlistHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
