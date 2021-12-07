import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummeryHomeComponent } from './summery-home.component';

describe('SummeryHomeComponent', () => {
  let component: SummeryHomeComponent;
  let fixture: ComponentFixture<SummeryHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummeryHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummeryHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
