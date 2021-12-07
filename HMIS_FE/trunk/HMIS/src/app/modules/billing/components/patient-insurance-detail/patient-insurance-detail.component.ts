import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DxDataGridComponent, DxPopupComponent } from 'devextreme-angular';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { BillingService } from "../../services/billing.service";
import * as moment from 'moment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-insurance-detail',
  templateUrl: './patient-insurance-detail.component.html',
  styleUrls: ['./patient-insurance-detail.component.scss']
})
export class PatientInsuranceDetailComponent implements OnInit {
  @Input() patientData: any;
  // @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;
  @ViewChild("insuranceDetailGridContainer") public dataGrid: DxDataGridComponent
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;

  alertMsg: IAlert;
  focusedRowData: any;
  focusedRowIndex: number;
  insuranceDetailArray: any;
  billingForm: any;
  editorOptions: object;
  allowEditing = false;

  constructor(public modal: NgbActiveModal,
    private billingService : BillingService,
    private router : Router) {
      this.onEditorPreparing = this.onEditorPreparing.bind(this);
      this.setPolicyRequestAmount = this.setPolicyRequestAmount.bind(this);
  }

  ngOnInit(): void {
    this.insuranceDetailArray = _.cloneDeep(this.patientData.insuranceDetailArray);
    this.billingForm = _.cloneDeep(this.patientData.patientInfo);
  }

  setPolicyRequestAmount(newData, value, currentRowData) {
    if (parseFloat(value) <= parseFloat(currentRowData.policyAmount)) {
      newData.policyRequestAmount = _.round(parseFloat(value), 2);
    } else {
      this.showValidationMsg('Tentative insurance request should not be greater than policy sum assured amount.');
    }
  }

  showValidationMsg(msg) {
    this.alertMsg = {
      message: msg,
      messageType: 'warning',
      duration: Constants.ALERT_DURATION
    };
  }

  onFocusedRowChanged(evt) {
    this.focusedRowData = evt.row.data;
    this.focusedRowIndex = evt.row.rowIndex;
  }

  onEditingStart(evt: any) {
  }

  onEditorPreparing(evt: any): void {
    // on cell value change event fire here
    let rowObj = this.insuranceDetailArray[evt?.row?.rowIndex];
    if (evt.parentType == "dataRow") {
      evt.editorOptions.onValueChanged = (e: any) => {
        evt.setValue(e.value);
        this.dataGrid.instance.refresh();
      }
    }

  }

  decimalWithPrecision(data: any) {
    return parseFloat(data.value || 0).toFixed(2);
  }

  saveInsuranceDetail() {
    this.modal.dismiss(this.insuranceDetailArray);
  }

  onContentReady(e) {
    e.component.option("loadPanel.enabled", false);
  }
}
