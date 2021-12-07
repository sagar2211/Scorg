import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnomedctComponent } from './snomedct.component';

describe('SnomedctComponent', () => {
  let component: SnomedctComponent;
  let fixture: ComponentFixture<SnomedctComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnomedctComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnomedctComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
