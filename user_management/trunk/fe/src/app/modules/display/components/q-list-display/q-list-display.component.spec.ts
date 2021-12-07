import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QListDisplayComponent } from './q-list-display.component';

describe('QListDisplayComponent', () => {
  let component: QListDisplayComponent;
  let fixture: ComponentFixture<QListDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QListDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QListDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
