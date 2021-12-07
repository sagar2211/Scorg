import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllComponentsDataDisplayComponent } from './all-components-data-display.component';

describe('AllComponentsDataDisplayComponent', () => {
  let component: AllComponentsDataDisplayComponent;
  let fixture: ComponentFixture<AllComponentsDataDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllComponentsDataDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllComponentsDataDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
