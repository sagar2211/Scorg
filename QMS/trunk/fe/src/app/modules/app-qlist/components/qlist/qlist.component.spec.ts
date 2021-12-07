import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QListComponent } from './qlist.component';

describe('QListComponent', () => {
  let component: QListComponent;
  let fixture: ComponentFixture<QListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
