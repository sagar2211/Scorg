import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-intake-output-selection',
  templateUrl: './intake-output-selection.component.html',
  styleUrls: ['./intake-output-selection.component.scss']
})
export class IntakeOutputSelectionComponent implements OnInit {

  @Input() messageDetails: any;
  reportRowData: any;
  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.reportRowData = _.cloneDeep(this.messageDetails.selectedData);
  }

  selectValueConfirm(typ: string) {
    const obj = {
      selectedValue: null,
      type: typ
    };
    if (typ === 'Ok') {

      this.reportRowData.fluidBal = (this.reportRowData.intakeIvFluidQty ? this.reportRowData.intakeIvFluidQty : 0)
        + (this.reportRowData.intakeRtFeedQty ? this.reportRowData.intakeRtFeedQty : 0)
        - ((this.reportRowData.outputRTQty ? this.reportRowData.outputRTQty : 0)
          + (this.reportRowData.outputUrineQty ? this.reportRowData.outputUrineQty : 0)
          + (this.reportRowData.outputDrainQty ? this.reportRowData.outputDrainQty : 0));
      obj.selectedValue = this.reportRowData;
      this.modal.close(obj);
    } else {
      this.modal.close(obj);
    }
  }

}
