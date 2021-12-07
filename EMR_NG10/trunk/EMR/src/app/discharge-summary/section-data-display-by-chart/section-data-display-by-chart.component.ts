import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-section-data-display-by-chart',
    templateUrl: './section-data-display-by-chart.component.html'
})
export class SectionDataDisplayByChartComponent implements OnInit {

    @Input() public discharge: any;

    constructor() { }

    ngOnInit() {
      //console.log(this.discharge, 'app-section-data-display-by-chart');
    }

    onEditUpdateSection(event, item): void {
        item.isShow = !item.isShow;
        event.stopPropagation();
    }

    onDisplayTypeChange(discharge, event, isSectionObject?: boolean): void {
        if (isSectionObject) {
            discharge['dataDisplayType'] = event.target.value;
        } else {
            discharge.summery.forEach(element => {
                element['dataDisplayType'] = event.target.value;
            });
        }
        event.stopPropagation();
    }

}
