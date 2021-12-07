import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialIndentListComponent } from './material-indent-list.component';

describe('MaterialIndentListComponent', () => {
  let component: MaterialIndentListComponent;
  let fixture: ComponentFixture<MaterialIndentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialIndentListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialIndentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
