import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import { InvestigationMaster } from './../../../public/models/investigation-master.model';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ConsultationService } from './../../../public/services/consultation.service';
import { OrderService } from './../../../public/services/order.service';
import { IcutempdataService } from './../../../public/services/icutempdata.service';
import { Subject } from 'rxjs';
import { CommonService } from './../../../public/services/common.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-investigation-report-sort-view',
  templateUrl: './investigation-report-sort-view.component.html',
  styleUrls: ['./investigation-report-sort-view.component.scss']
})
export class InvestigationReportSortViewComponent implements OnInit, OnDestroy {
  labOrderList = [];
  labOrderListSelected: InvestigationMaster[] = [];
  patientObj: any;
  patientId: any;
  destroy$ = new Subject<any>();

  investigationOrder: FormGroup;
  constructor(
    private fb: FormBuilder,
    private icutempdataService: IcutempdataService,
    private orderService: OrderService,
    private router: Router,
    private consultationService: ConsultationService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.createForm();
    this.getSelectedLabList();
    this.getOrderLabList();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  createForm() {
    this.investigationOrder = this.fb.group({
      investigationList: this.fb.array([])
    });
  }

  patchDefaultValue(val, check) {
    const form = {
      investigation: [val],
      isSelected: [check]
    };
    this.investigationList.push(this.fb.group(form));
  }

  getSelectedLabList() {
    _.map(this.icutempdataService.investigationList, (v) => {
      v.id = _.toNumber(v.id);
      v.investigation_head_id = _.toNumber(v.headId);
      v.default_comment = v.comment;
      const investigationMaster = new InvestigationMaster();
      if (investigationMaster.isObjectValid(v)) {
        investigationMaster.generateObject(v);
        this.labOrderListSelected.push(investigationMaster);
      }
    });
  }

  getOrderLabList() {
    this.orderService.getOrderData('labOrders').subscribe((result: any[]) => {
      this.labOrderList = result;
      this.checkExistInSelected();
    });
  }

  showOrderPage() {
    this.router.navigate(['/emr/patient/orders/ipd/' + this.patientId]);
  }

  navigate(navigateURL) {
    this.router.navigate(['/emr/patient/orders/ipd/' + this.patientId]);
    // navigateURL = 'dashboard/patientDashboard/' + navigateURL + '/';
    // this.router.navigate([navigateURL, 'ipd', this.patientId], { skipLocationChange: true, queryParams: { from: 'icuFlowSheet' } });
  }

  checkExistInSelected() {
    _.map(this.labOrderListSelected, (val) => {
      let selected = false;
      const findData = _.findIndex(this.labOrderList, (i) => {
        return _.toNumber(i.labInvestigationObj.id) === _.toNumber(val.id);
      });
      if (findData !== -1) {
        selected = true;
      }
      this.patchDefaultValue(val, selected);
    });
  }

  updateValues(suggestObject) {
    if (suggestObject.isSelected) {
      const obj = {
        action: '',
        componentList: null,
        id: '',
        invalidObjectMessage: '',
        isDirty: true,
        isValidObject: true,
        labInstruction: '',
        labInvestigationObj: suggestObject.investigation,
        name: suggestObject.investigation.name,
        patientConsentNeeded: '',
        patientInstruction: '',
        priority: '',
        reason: '',
        recurring: undefined,
        selectedComponentCount: 1,
        specimen: '',
        startDateTime: new Date(),
        status: "approvelPending",
        tempId: moment(new Date()).valueOf(),
        tempstatus: ''
      };
      this.labOrderList.push(_.cloneDeep(obj));
    } else {
      const findData = _.findIndex(this.labOrderList, (i) => {
        return _.toNumber(i.labInvestigationObj.id) === _.toNumber(suggestObject.investigation.id);
      });
      if (findData !== -1) {
        this.labOrderList.splice(findData, 1);
      }
    }
  }

  get investigationList() {
    return this.investigationOrder.get('investigationList') as FormArray;
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  subcriptionOfEvents() {
    this.commonService.$subAddRemoveActivePatientFromList.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.getpatientData(obj.data);
    });
  }


}
