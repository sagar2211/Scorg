import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametarListComponent } from './parametar-list.component';

describe('ParametarListComponent', () => {
  let component: ParametarListComponent;
  let fixture: ComponentFixture<ParametarListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParametarListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParametarListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
