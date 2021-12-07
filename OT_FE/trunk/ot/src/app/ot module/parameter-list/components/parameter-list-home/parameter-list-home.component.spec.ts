import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterListHomeComponent } from './parameter-list-home.component';

describe('ParameterListHomeComponent', () => {
  let component: ParameterListHomeComponent;
  let fixture: ComponentFixture<ParameterListHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParameterListHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterListHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
