import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExminationTypeComponent } from './exmination-type.component';

describe('ExminationTypeComponent', () => {
  let component: ExminationTypeComponent;
  let fixture: ComponentFixture<ExminationTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExminationTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExminationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
