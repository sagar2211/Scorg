import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckListHomeComponent } from './check-list-home.component';

describe('CheckListHomeComponent', () => {
  let component: CheckListHomeComponent;
  let fixture: ComponentFixture<CheckListHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckListHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckListHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
