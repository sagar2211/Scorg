import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultLandingSelectionComponent } from './default-landing-selection.component';

describe('DefaultLandingSelectionComponent', () => {
  let component: DefaultLandingSelectionComponent;
  let fixture: ComponentFixture<DefaultLandingSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefaultLandingSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultLandingSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
