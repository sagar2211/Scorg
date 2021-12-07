import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummeryInstructionComponent } from './summery-instruction.component';

describe('SummeryInstructionComponent', () => {
  let component: SummeryInstructionComponent;
  let fixture: ComponentFixture<SummeryInstructionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummeryInstructionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummeryInstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
