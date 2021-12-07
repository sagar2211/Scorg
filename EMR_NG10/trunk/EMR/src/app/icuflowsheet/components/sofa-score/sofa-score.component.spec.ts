import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SofaScoreComponent } from './sofa-score.component';

describe('SofaScoreComponent', () => {
  let component: SofaScoreComponent;
  let fixture: ComponentFixture<SofaScoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SofaScoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SofaScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
