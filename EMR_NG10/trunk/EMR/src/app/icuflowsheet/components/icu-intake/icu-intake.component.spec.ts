import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcuIntakeComponent } from './icu-intake.component';

describe('IcuIntakeComponent', () => {
  let component: IcuIntakeComponent;
  let fixture: ComponentFixture<IcuIntakeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcuIntakeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcuIntakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
