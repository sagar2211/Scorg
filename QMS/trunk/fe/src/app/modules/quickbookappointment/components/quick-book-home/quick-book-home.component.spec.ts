import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickBookHomeComponent } from './quick-book-home.component';

describe('QuickBookHomeComponent', () => {
  let component: QuickBookHomeComponent;
  let fixture: ComponentFixture<QuickBookHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickBookHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickBookHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
