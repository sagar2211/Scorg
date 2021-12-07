import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

@Component({
  selector: 'app-investigation-component-list',
  templateUrl: './investigation-component-list.component.html',
  styleUrls: ['./investigation-component-list.component.scss']
})
export class InvestigationComponentListComponent implements OnInit {
  @Input() selectedInvestigationComponentList: any;
  alertMsg: any;
  message: string;

  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.message = '';
  }

  updateCheckBoxValue(item) {
    const selectedCount = _.filter(this.selectedInvestigationComponentList.componentList, (val, indx) => {
      return val.isSelected == true;
    });
    let updateCheckBoxVal = true;

    if (selectedCount.length == 1) {
      if (selectedCount[0].id != item.id) {
        updateCheckBoxVal = true;
      } else {
        updateCheckBoxVal = false;
        this.message = 'Required Minimum One Component Selection';
      }
    }
    if (updateCheckBoxVal) {
      this.message = '';
      const selectedValIndx = _.findIndex(this.selectedInvestigationComponentList.componentList, (val, indx) => {
        return val.id == item.id;
      });
      if (selectedValIndx != -1) {
        this.selectedInvestigationComponentList.componentList[selectedValIndx].isSelected = !this.selectedInvestigationComponentList.componentList[selectedValIndx].isSelected;
      }
    }
  }

}
