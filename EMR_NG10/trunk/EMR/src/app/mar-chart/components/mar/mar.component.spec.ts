import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarComponent } from './mar.component';

describe('MarComponent', () => {
  let component: MarComponent;
  let fixture: ComponentFixture<MarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
