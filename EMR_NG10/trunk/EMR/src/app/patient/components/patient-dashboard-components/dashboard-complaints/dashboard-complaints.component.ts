import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-dashboard-complaints',
    templateUrl: './dashboard-complaints.component.html'
})
export class DashboardComplaintsComponent implements OnInit {
    @Input() dashboardDataList: Array<any>;

    constructor() { }

    ngOnInit() {

    }
}
