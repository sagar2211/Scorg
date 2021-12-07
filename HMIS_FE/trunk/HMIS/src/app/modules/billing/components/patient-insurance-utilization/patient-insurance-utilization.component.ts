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
  selector: 'app-patient-insurance-utilization',
  templateUrl: './patient-insurance-utilization.component.html',
  styleUrls: ['./patient-insurance-utilization.component.scss']
})
export class PatientInsuranceUtilizationComponent implements OnInit {
  @Input() patientData: any;
  // @ViewChild(DxDataGridComponent, { static: false }) public dataGrid: DxDataGridComponent;
  @ViewChild("patientInsuranceGridContainer") public dataGrid: DxDataGridComponent
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;

  alertMsg: IAlert;
  billServiceData = [];
  focusedRowData: any;
  focusedRowIndex: number;
  allMode: string;
  checkBoxesMode: string;
  insuranceData: any;

  totalApprovalAmount: number;
  totalUtilizedAmount: number;
  billingForm: any;
  editorOptions: object;
  popupVisible = false;
  selectedRowInfo: any;
  allowEditing = false;

  activeTab = "insurance";

  constructor(public modal: NgbActiveModal, private billingService : BillingService, private router : Router) {
    this.allMode = 'allPages';
    this.checkBoxesMode = 'onClick'
    this.onEditorPreparing = this.onEditorPreparing.bind(this);
    this.onInfo = this.onInfo.bind(this);
  }

  ngOnInit(): void {
    this.billServiceData = this.patientData.billServiceData;
    this.billingForm = this.patientData.patientInfo;
    _.remove(this.billServiceData,item=>{
      return (item.status === "REVERSE")
    })
    this.billingService.getInsuranceDetail(this.patientData.uhId,this.patientData.penId).subscribe((response)=>{
      this.insuranceData = response;

      // add default utilized amount zero
      _.map(this.insuranceData, (req) => {
        //req.utilizedAmount = 0;
        req.insuranceFromDate = moment(req.insuranceFromDate).format('DD-MM-YYYY');
        req.insuranceToDate = moment(req.insuranceToDate).format('DD-MM-YYYY');
        req.insuranceDate = req.insuranceFromDate + " to " + req.insuranceToDate;
        req.approvalDate = moment(req.approvalDate).format('DD-MM-YYYY');
        req.customName = (req?.approvalDate && req.approvalDate != 'Invalid date')? req.clientName + " - " + req.approvalDate : req.clientName;
        _.map(req.rules, (rule,indx) => {
          rule.srNo = indx + 1;
          //rule.utilizedAmount = 0;
          rule.utilizedQty = 0;
        });
      });

      // check already applied insurance rate to the service
      const isAlreadyApplied = _.find(this.billServiceData, (o) => { return o.patInsApprovalId > 0 && o.approvalAmmount > 0; });

      // add default approval amount zero
      _.map(this.billServiceData, (o) => {
        o.orderDate = moment(o.orderDate).format('DD-MM-YYYY');
        o.serviceCategory = o.isNonService ? o.nonServiceHeadName : o.service.serviceHeadName;
        //o.patInsApprovalId = 0;
        //o.insuranceRate = 0;
        //o.approvalAmmount = 0;
        o.insuranceRateCopy = o.insuranceRate;
        o.approvalAmmountCopy = o.approvalAmmount;
        o.selfContriAmt = o.totNetAmt - o.approvalAmmount;
      });

      this.adjustInsuranceAmountIntoBill();
    })

  }

  adjustInsuranceAmountIntoBill() {
    // sort array by category type and capping type to apply first priority to PERUNIT
    this.insuranceData = _.sortBy(this.insuranceData, (o) => {
      return o.priorityNo; //&&  o.piaId && o.categoryType && (o.cappingType == 'PERUNIT' ? 1 : 2);
    });

    let insuranceArray = this.insuranceData;
    let billServiceArray = this.billServiceData;

    // utlize insurance amount as per insurance company priority
    _.map(billServiceArray, (srvObj, index) => {
      // check insurance all approval request for utilization....
        _.map(insuranceArray, (insurance) => {
          // check amount is remaining for utilization
          if (insurance.approvalAmount > insurance.utilizedAmount) {
            // check any for insurance approved amount available and capping rules
            const cappingRuleIndex = this.getCappingRuleIndex(srvObj, insurance);

            // consume insurance amount as per capping rule first
            if (cappingRuleIndex != -1) {
              const cappingRule = insurance.rules[cappingRuleIndex];
              // srvObj.service.serviceType = cappingRule.categoryType;
              // if capping type is per unit
              if (!srvObj.patInsApprovalId && cappingRule.cappingType == 'PERUNIT') {
                // take minimum amount between self contibution or insurance avail amount
                const availableQty = cappingRule.cappingQty - cappingRule.utilizedQty;
                if (availableQty > 0) {
                  const srvicePerUnitAmount = srvObj.totNetAmt / srvObj.orderQty;
                  let utilizedAmount = (cappingRule.cappingAmount < srvicePerUnitAmount  ? cappingRule.cappingAmount : srvicePerUnitAmount);
                  let utilizedQty = availableQty < srvObj.orderQty ? availableQty : srvObj.orderQty;

                  // update actual approval amount and qty
                  const serviceApprovalAmmount = utilizedAmount * utilizedQty;
                  cappingRule.utilizedAmount += serviceApprovalAmmount;
                  cappingRule.utilizedQty += utilizedQty;

                  //update insuranceRate
                  srvObj.insuranceRateCopy = srvObj.insuranceRate = cappingRule.cappingAmount;

                  // update approvalAmmount
                  srvObj.approvalAmmountCopy = srvObj.approvalAmmount += serviceApprovalAmmount;
                  srvObj.selfContriAmt = srvObj.totNetAmt - srvObj.approvalAmmount;
                  srvObj.patInsApprovalId = insurance.piaId;

                  // update utilized amount into main insurance obj
                  insurance.utilizedAmount += serviceApprovalAmmount;
                }
              }

              // if capping type is amount
              else if (!srvObj.patInsApprovalId && cappingRule.cappingType == 'AMOUNT') {
                // take minimum amount between self contibution or insurance avail amount
                const availAmount = cappingRule.cappingAmount - cappingRule.utilizedAmount;
                if (availAmount > 0) {
                  // take minimum amount between self contibution or insurance avail amount
                  const serviceAmount = srvObj.totNetAmt - srvObj.approvalAmmount;
                  const utilizedAmount = availAmount < serviceAmount  ? availAmount : serviceAmount;
                  cappingRule.utilizedAmount += utilizedAmount;

                  // update approvalAmmount
                  srvObj.approvalAmmountCopy = srvObj.approvalAmmount += utilizedAmount;
                  srvObj.selfContriAmt = srvObj.totNetAmt - srvObj.approvalAmmount;
                  srvObj.patInsApprovalId = insurance.piaId;

                  // update utilized amount into main insurance obj
                  insurance.utilizedAmount += utilizedAmount;
                }
              }
            }

            // incase capping rule is not applicable to current row item
            // then consume remainung insurance approval amount
            if (!srvObj.patInsApprovalId && cappingRuleIndex == -1) {
              const availAmount = insurance.approvalAmount - insurance.utilizedAmount;
              if (availAmount > 0) {
                // take minimum amount between self contibution or insurance avail amount
                const serviceAmount = srvObj.totNetAmt - srvObj.approvalAmmount;
                const utilizedAmount = availAmount < serviceAmount  ? availAmount : serviceAmount;

                //update insuranceRate
                srvObj.insuranceRateCopy = srvObj.insuranceRate = srvObj.totNetAmt/srvObj.orderQty;

                // update approvalAmmount
                srvObj.approvalAmmountCopy = srvObj.approvalAmmount += utilizedAmount;
                srvObj.selfContriAmt = srvObj.totNetAmt - srvObj.approvalAmmount;
                srvObj.patInsApprovalId = insurance.piaId;

                // update utilized amount into main insurance obj
                insurance.utilizedAmount += utilizedAmount;
              }
            }
          }
        });

        srvObj.isChecked = srvObj.approvalAmmount > 0 ? true : false;
    });

    this.billCalculation();

    // refresh grid data
    setTimeout(() => {
      this.dataGrid.instance.refresh();
    }, 200);
  }

  getCappingRuleIndex(srvObj, insurance) {
    // check for capping rules for categoty type service
    var cappingRuleIndex = _.findIndex(insurance.rules, (o) => {
      return !srvObj.isNonService && o.categoryType == 'SERVICE' && srvObj.service.serviceId == o.subServiceId;
    });

    // check for capping rules for categoty type fixed
    if (cappingRuleIndex == -1) {
      cappingRuleIndex = _.findIndex(insurance.rules, (o) => {
        return !srvObj.isNonService && o.categoryType == 'FIXED' && srvObj.service.serviceHeadId == o.subServiceId;
      });
    }

    // check for capping rules for categoty type NonService
    if (cappingRuleIndex == -1) {
      cappingRuleIndex = _.findIndex(insurance.rules, (o) => {
        return srvObj.isNonService && o.categoryType == 'NONSERVICE' && (o.bedTypeId > 0 ?
            (srvObj.nonServiceHeadId == o.subServiceId && srvObj.nonServiceBedTypeId == o.bedTypeId) : (srvObj.nonServiceHeadId == o.subServiceId));
      });
    }

    return cappingRuleIndex;
  }

  billCalculation(){
    this.totalApprovalAmount = _.sumBy(this.insuranceData, (o) => {
      return o.approvalAmount || 0;
    });
    this.totalUtilizedAmount = _.sumBy(this.billServiceData, (o) => {
      return o.approvalAmmount || 0;
    });
  }

  calSelfContri(newData,value, currentRowData){
    currentRowData.approvalAmmountCopy = currentRowData.approvalAmmount = parseFloat(value).toFixed(2);
  }

  getServiceNameWithType(rowData) {
    const serviceObj = rowData ? (rowData.serviceName ? rowData : rowData.service) : { serviceName: '' };
    if (rowData.isNonService) {
      return serviceObj.serviceName;
    } else {
      return serviceObj.serviceName ? (serviceObj.serviceName + " (" + serviceObj.serviceType + ")") : '';
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
    if (evt.column.dataField == 'isAdvanceApply' && evt.data.chqCleared != 'Y') {
      evt.cancel = true;
    } else if (evt.column.dataField == 'applicableAmount' && !evt.data.isAdvanceApply) {
      evt.cancel = true;
    } else if (evt.column.dataField == 'insuranceRate' && evt.data.isChecked === true) {
      evt.cancel = false;
    } else if (evt.column.dataField == 'insuranceRate' && evt.data.isChecked === false) {
      evt.cancel = true;
    }
  }

  onEditorPreparing(evt: any): void {
    // on cell value change event fire here
    let rowObj = this.billServiceData[evt?.row?.rowIndex];
    if (evt.parentType == "dataRow") {
      evt.editorOptions.onValueChanged = (e: any) => {
        evt.setValue(e.value);
        const prevApproveAmt = rowObj.approvalAmmount;
        console.log(evt.dataField)
        if (evt.dataField == 'isChecked') {
          if(e.value){
            rowObj.insuranceRate = rowObj.insuranceRateCopy;
            rowObj.approvalAmmount = rowObj.approvalAmmountCopy;
            this.dataGrid.instance.refresh();
          } else {
            rowObj.insuranceRate = 0;
            rowObj.approvalAmmount = 0;
            this.dataGrid.instance.refresh();
          }

        } else if (evt.dataField == 'patInsApprovalId') {
          rowObj.patInsApprovalId = e.value;
        } else if (evt.dataField == 'insuranceRate') {
          if(e.value < rowObj.totNetAmt){
            rowObj.insuranceRateCopy = rowObj.insuranceRate = e.value;
            rowObj.approvalAmmountCopy = rowObj.approvalAmmount = e.value * rowObj.orderQty;
            rowObj.selfContriAmt = rowObj.totNetAmt - rowObj.approvalAmmount;
          } else if(e.value > rowObj.totNetAmt){
            rowObj.insuranceRateCopy = rowObj.insuranceRate = e.previousValue;
            rowObj.approvalAmmountCopy = rowObj.approvalAmmount = e.previousValue * rowObj.orderQty;
            rowObj.selfContriAmt = rowObj.totNetAmt - rowObj.approvalAmmount;
          }
          this.billCalculation();
          setTimeout(() => {
            if(this.totalUtilizedAmount > this.totalApprovalAmount){
              rowObj.insuranceRateCopy = rowObj.insuranceRate = e.previousValue;
              rowObj.approvalAmmountCopy = rowObj.approvalAmmount = prevApproveAmt;
              rowObj.selfContriAmt = rowObj.totNetAmt - rowObj.approvalAmmount;
              this.billCalculation();
              this.dataGrid.instance.refresh();
            }
          }, 100);
        }
        this.dataGrid.instance.refresh();
      }
    }

  }

  decimalWithPrecision(data: any) {
    return parseFloat(data.value || 0).toFixed(2);
  }

  getSelectedRowsData(){
    let selectedRow = []
    selectedRow = this.dataGrid.instance.getSelectedRowsData();

        // ===== or when deferred selection is used =====
        this.dataGrid.instance.getSelectedRowsData().then((selectedRowsData) => {
            // Your code goes here
        });
  }

  saveInsurancePayment() {
    let param = []
    _.map(this.billServiceData, (servObj) => {
      if(servObj.approvalAmmount > 0){
        let obj = {};
        obj = {
          pbmId : this.billingForm.value.billId,
          pbdId : servObj.billDetailId,
          insuranceRate: servObj.insuranceRate,
          approvedAmount : servObj.approvalAmmount,
          piaId : servObj.patInsApprovalId
        }
        param.push(obj);
      }
    });
    if (param.length == 0) {
      this.alertMsg = {
        message: 'record save successfully!',
        messageType: 'success',
        duration: Constants.ALERT_DURATION
      };
      return;
    }

    this.billingService.SavePatientBillInsuranceDetail(param).subscribe((res)=>{
      if (res === true) {
        this.modal.dismiss(res);
      }
    },err=>{
      this.alertMsg = {
        message: 'record not saved!',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
    })
  }

  onInfo(e) {
    let rowIndex = e.row.rowIndex;
    this.selectedRowInfo = e.row.data.rules;
    this.popupVisible = true;
  }

  onContentReady(e) {
    e.component.option("loadPanel.enabled", false);
  }
}
