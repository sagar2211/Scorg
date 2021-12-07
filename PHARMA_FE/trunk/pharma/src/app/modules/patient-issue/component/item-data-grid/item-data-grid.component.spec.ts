import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemDataGridComponent } from './item-data-grid.component';

describe('ItemDataGridComponent', () => {
  let component: ItemDataGridComponent;
  let fixture: ComponentFixture<ItemDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemDataGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
