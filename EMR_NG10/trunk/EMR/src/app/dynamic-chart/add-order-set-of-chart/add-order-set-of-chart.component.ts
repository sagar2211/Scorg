import { Constants } from 'src/app/config/constants';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from './../../public/services/auth.service';
import { DynamicChartService } from './../dynamic-chart.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, Input } from '@angular/core';
import { IAlert } from './../../public/models/AlertMessage';

@Component({
  selector: 'app-add-order-set-of-chart',
  templateUrl: './add-order-set-of-chart.component.html',
  styleUrls: ['./add-order-set-of-chart.component.scss']
})
export class AddOrderSetOfChartComponent implements OnInit {
  orderSetFrm: FormGroup;
  chartInfo: any;
  userInfo = null;
  submitted = false;
  setAlertMessage: IAlert;

  @Input() public selectedOrderSet: any;
  @Input() public componentList: any;

  constructor(
    public modal: NgbActiveModal,
    private dynamicChartService: DynamicChartService,
    private authService: AuthService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.orderSetFrm = this.fb.group({
      ordersetName: ['', Validators.required],
      ordersetDesc: ['', Validators.required],
      selectedType: ['user', Validators.required]
    });
    if (this.selectedOrderSet) {
      const selectedType = this.selectedOrderSet.userId ? 'user' : this.selectedOrderSet.specialityId ? 'speciality' : 'user';

      this.orderSetFrm.patchValue({
        ordersetName: this.selectedOrderSet.ordersetName,
        ordersetDesc: this.selectedOrderSet.ordersetDesc,
        selectedType: [selectedType, Validators.required]
      });
    }

    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.chartInfo = this.dynamicChartService.getActiveChartParamData(false, []);
  }

  saveOrderSet(): void {
    this.submitted = true;
    if (this.orderSetFrm.invalid) {
      return;
    } else if (!(this.chartInfo.chart_data)) {
      this.setAlertMessage = {
        message: 'Please add at least one item in orderset',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const reqParams = {
      visitOrdersetId: this.selectedOrderSet ? this.selectedOrderSet.visitOrdersetId : 0,
      serviceTypeId: this.chartInfo.service_type_id,
      ordersetName: this.orderSetFrm.value.ordersetName,
      ordersetDesc: this.orderSetFrm.value.ordersetDesc,
      userId: this.orderSetFrm.value.selectedType === 'user' ? this.userInfo.user_id : null,
      specialityId: this.userInfo.speciality_id,
      patientChartId: this.chartInfo.patient_chart_id,
      chartData: this.chartInfo.chart_data
    };
    this.dynamicChartService.savePateintVisitOrderSet(reqParams).subscribe((res: any) => {
      if (res.status_message === 'Success') {
        reqParams.visitOrdersetId = res.data;
        const mode = this.selectedOrderSet ? 'UPDATE' : 'ADD';
        this.modal.close({ mode, data: reqParams });
      } else {
        this.setAlertMessage = {
          message: res.message,
          messageType: 'danger',
          duration: Constants.ALERT_DURATION
        };
      }
    });
  }

}
