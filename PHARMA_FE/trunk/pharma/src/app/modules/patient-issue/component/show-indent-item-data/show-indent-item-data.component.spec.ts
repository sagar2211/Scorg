import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowIndentItemDataComponent } from './show-indent-item-data.component';

describe('ShowIndentItemDataComponent', () => {
  let component: ShowIndentItemDataComponent;
  let fixture: ComponentFixture<ShowIndentItemDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowIndentItemDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowIndentItemDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
