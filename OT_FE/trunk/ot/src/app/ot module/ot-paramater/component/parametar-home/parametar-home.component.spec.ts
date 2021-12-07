import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametarHomeComponent } from './parametar-home.component';

describe('ParametarHomeComponent', () => {
  let component: ParametarHomeComponent;
  let fixture: ComponentFixture<ParametarHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParametarHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParametarHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
