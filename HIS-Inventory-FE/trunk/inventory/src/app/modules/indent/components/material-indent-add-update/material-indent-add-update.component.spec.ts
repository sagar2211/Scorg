import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialIndentAddUpdateComponent } from './material-indent-add-update.component';

describe('MaterialIndentAddUpdateComponent', () => {
  let component: MaterialIndentAddUpdateComponent;
  let fixture: ComponentFixture<MaterialIndentAddUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialIndentAddUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialIndentAddUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
