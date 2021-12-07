import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasePaperValidityComponent } from './case-paper-validity.component';

describe('CasePaperValidityComponent', () => {
  let component: CasePaperValidityComponent;
  let fixture: ComponentFixture<CasePaperValidityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CasePaperValidityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CasePaperValidityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
