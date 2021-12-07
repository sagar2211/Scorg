import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentPartialViewComponent } from './consent-partial-view.component';

describe('ConsentPartialViewComponent', () => {
  let component: ConsentPartialViewComponent;
  let fixture: ComponentFixture<ConsentPartialViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsentPartialViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsentPartialViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
