import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialIndentHomeComponent } from './material-indent-home.component';

describe('MaterialIndentHomeComponent', () => {
  let component: MaterialIndentHomeComponent;
  let fixture: ComponentFixture<MaterialIndentHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialIndentHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialIndentHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
