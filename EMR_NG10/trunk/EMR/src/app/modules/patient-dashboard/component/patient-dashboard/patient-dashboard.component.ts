import { ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import { EncounterPatient } from 'src/app/public/models/encounter-patient.model';
import { OrderService } from 'src/app/public/services/order.service';
import { CommonService } from 'src/app/public/services/common.service';
import { PatientService } from 'src/app/public/services/patient.service';
import { MarService } from 'src/app/patient/services/mar.service';
import { UsersService } from 'src/app/public/services/users.service';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.scss']
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
  medicineDetails: any[] = [];
  patientObj: EncounterPatient;
  patientId: any;
  destroy$ = new Subject<any>();
  dashboardDataListByObjects: {
    allergy_detail: Array<any>,
    complaint_detail: Array<any>,
    diagnosis_detail: Array<any>,
    prescription_detail: Array<any>,
  } = null;
  dashboardDataList = [];
  onGoingMedication = [];

  constructor(
    private orderService: OrderService,
    private commonService: CommonService,
    private patientService: PatientService,
    private activatedRoute: ActivatedRoute,
    private marService: MarService,
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(res => {
      const patId = res.get('patientId');
      const details = this.commonService.getActivePatintData(patId);
      this.getpatientData(details);
      this.getPatientDashboardData();
    });

    this.getpatientData();
    // this.getMedicineOrdersData();
    // this.getPatientDashboardTimelineData();
    this.subcriptionOfEvents();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  getMedicineOrdersData() {
    // this.dashboardservice.getPatientDetailsByPatId(this.patientId).subscribe(r => {
    const params = {
      serviceTypeId: this.patientObj.serviceType.id,
      patientId: this.patientId,
      visitNo: this.patientObj.visitNo
    };
    this.orderService.getOrderDetailsByIpdId(params).subscribe(result => {
      const data = this.orderService.getOrderData('medicineOrders', true);
      this.medicineDetails = data;
    });
    // });
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
      this.getPatientDashboardData();
    });
  }

  getPatientDashboardData() {
    const param = {
      service_type_id: this.patientObj.isViewOnlyPat ? Constants.ServiceType.OPD : this.patientObj.serviceType.id,
      patient_id: this.patientObj.patientData.id,
      visit_no: this.patientObj.visitNo,
    };
    this.patientService.getPatientDashboardData(param).subscribe(res => {
      this.dashboardDataList = [];
      if (res.length > 0) {
        this.dashboardDataList = res;
        this.modifyDashboardData(res);
      } else {
        this.dashboardDataList = [];
      }
    });

    if(this.patientObj.isViewOnlyPat){
      return;
    }

    // other than OPD show on going medications
    if (this.patientObj.serviceType.id !== Constants.ServiceType.OPD) {
      const param1 = {
        ipd_id: this.patientObj.visitNo,
        patient_id: this.patientObj.patientData.id,
        ongoing : true
      };
      this.marService.getPatientMarChartData(param1).subscribe(res => {
        this.onGoingMedication = res.medicineData;
      });
    }
  }

  modifyDashboardData(list): void {
    const tempObj: Object = {};
    list.forEach((element: any) => {
      const keys = Object.keys(element.chart_data);
      keys.forEach(key => {
        if (key === 'allergy_detail') {
          if (element.chart_data[key] && element.chart_data[key].is_allergy_selected === 'yes') {
            element.chart_data[key] = element.chart_data[key].allergy_data;
          } else {
            element.chart_data[key] = [];
          }
        }
        element.chart_data[key].forEach(dt => {
          dt['consultation_datetime'] = element.consultation_datetime;
          if (!tempObj.hasOwnProperty(key)) {
            tempObj[key] = tempObj[key] === undefined ? [] : tempObj[key];
            (tempObj[key] as Array<any>).push(Object.assign({}, dt));
          } else {
            (tempObj[key] as Array<any>).push(Object.assign({}, dt));
          }
        });
      });
    });
    this.dashboardDataListByObjects = { ...tempObj } as any;
  }


  // getPatientDashboardTimelineData(event?): void {
  //   const param = {
  //     serviceTypeId: this.patientObj.serviceType.id,
  //     patientId: this.patientObj.patientData.id,
  //     visitNo: this.patientObj.visitNo,
  //     // date: new Date(),
  //     from_date: new Date(),
  //     to_date: new Date()
  //   };
  //   this.patientService.getPatientDashboardTimelineData(param).subscribe(res => {
  //     this.timeLineListActivityByKey = res;
  //   });
  // }

}
