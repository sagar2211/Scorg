import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterCheckComponent } from './parameter-check.component';

describe('ParameterCheckComponent', () => {
  let component: ParameterCheckComponent;
  let fixture: ComponentFixture<ParameterCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParameterCheckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
