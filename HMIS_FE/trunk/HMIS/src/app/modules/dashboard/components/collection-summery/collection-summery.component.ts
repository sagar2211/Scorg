import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-collection-summery',
  templateUrl: './collection-summery.component.html',
  styleUrls: ['./collection-summery.component.scss']
})
export class CollectionSummeryComponent implements OnInit {

  @Input() dashboardData;
  collectionSummery;
  constructor() { }

  ngOnInit(): void {
    this.collectionSummery = this.dashboardData && this.dashboardData.collectionSummery ? this.dashboardData.collectionSummery : null;
  }

}
