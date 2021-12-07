import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueSummeryComponent } from './revenue-summery.component';

describe('RevenueSummeryComponent', () => {
  let component: RevenueSummeryComponent;
  let fixture: ComponentFixture<RevenueSummeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevenueSummeryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RevenueSummeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
