import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QDsiplayGridDetailsComponent } from './q-dsiplay-grid-details.component';

describe('QDsiplayGridDetailsComponent', () => {
  let component: QDsiplayGridDetailsComponent;
  let fixture: ComponentFixture<QDsiplayGridDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QDsiplayGridDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QDsiplayGridDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
