import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialIndentSummeryListComponent } from './material-indent-summery-list.component';

describe('MaterialIndentSummeryListComponent', () => {
  let component: MaterialIndentSummeryListComponent;
  let fixture: ComponentFixture<MaterialIndentSummeryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialIndentSummeryListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialIndentSummeryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
