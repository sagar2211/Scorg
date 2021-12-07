import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionSummeryComponent } from './collection-summery.component';

describe('CollectionSummeryComponent', () => {
  let component: CollectionSummeryComponent;
  let fixture: ComponentFixture<CollectionSummeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionSummeryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionSummeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
