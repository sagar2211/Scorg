import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummeryRulesComponent } from './summery-rules.component';

describe('SummeryRulesComponent', () => {
  let component: SummeryRulesComponent;
  let fixture: ComponentFixture<SummeryRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummeryRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummeryRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
