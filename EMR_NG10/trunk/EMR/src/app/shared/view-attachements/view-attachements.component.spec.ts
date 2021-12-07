import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAttachementsComponent } from './view-attachements.component';

describe('ViewAttachementsComponent', () => {
  let component: ViewAttachementsComponent;
  let fixture: ComponentFixture<ViewAttachementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAttachementsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAttachementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
