import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IvFluidFeedComponent } from './iv-fluid-feed.component';

describe('IvFluidFeedComponent', () => {
  let component: IvFluidFeedComponent;
  let fixture: ComponentFixture<IvFluidFeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IvFluidFeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IvFluidFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
