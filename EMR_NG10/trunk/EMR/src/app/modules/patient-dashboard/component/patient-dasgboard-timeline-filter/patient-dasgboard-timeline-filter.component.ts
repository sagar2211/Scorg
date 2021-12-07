import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/public/services/users.service';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { PatientDashboardService } from 'src/app/patient/services/patient-dashboard.service';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
@Component({
  selector: 'app-patient-dasgboard-timeline-filter',
  templateUrl: './patient-dasgboard-timeline-filter.component.html',
  styleUrls: ['./patient-dasgboard-timeline-filter.component.scss']
})
export class PatientDasgboardTimelineFilterComponent implements OnInit {

  patientObj: any;
  patientId: any;
  chartDataArray = [];
  chartDataArrayClone = [];
  searchString = null;
  selectDeselectAll = false;
  alertMsg: IAlert;

  constructor(
    private userService: UsersService,
    private authService: AuthService,
    private commonService: CommonService,
    public modal: NgbActiveModal,
    public patientDashboardService: PatientDashboardService,
  ) { }

  ngOnInit(): void {
    this.getpatientData();
    this.getUserChartComponentList();
  }

  getUserChartComponentList() {
    const loginUser = this.authService.getUserInfoFromLocalStorage();
    const param = {
      serviceTypeId: this.patientObj.serviceType.id,
      specialityId: loginUser.speciality_id,
      roleTypeId: loginUser.roletype_id,
      userId: loginUser.user_id,
    };
    this.userService.getUserChartComponentList(param).subscribe(response => {
      if (response) {
        this.chartDataArray = response.data;
        _.map(this.chartDataArray, dt => {
          dt.isSelected = false;
        });
        this.chartDataArrayClone = _.cloneDeep(this.chartDataArray);
        const data = this.patientDashboardService.getFilterData(this.patientId);
        if (data.length > 0) {
          _.map(data, dt => {
            const fIndx = _.findIndex(this.chartDataArray, ind => {
              return ind.sectionRefId === dt.sectionRefId;
            });
            if (fIndx !== -1) {
              this.chartDataArray[fIndx].isSelected = true;
            }
          });
        }
      } else {
        this.chartDataArrayClone = [];
      }
    });
  }

  getpatientData(patient?) {
    if (patient) {
      this.patientObj = patient;
    } else {
      this.patientObj = this.commonService.getLastActivePatient();
    }
    this.patientId = this.patientObj.patientData.id;
  }

  updateValueFilter() {
    const loginUser = this.authService.getUserInfoFromLocalStorage();
    const selectedFilter = _.filter(this.chartDataArray, dt => {
      return dt.isSelected === true;
    });
    const param = {
      userId: loginUser.user_id,
      key: 'dashboard_section_setting' + this.patientObj.type,
      value: JSON.stringify(selectedFilter)
    };
    this.patientDashboardService.saveUserSetting(param).subscribe(res => {
      this.patientDashboardService.setFilterData(this.patientId, selectedFilter);
      const obj = {
        type: 'update',
        data: selectedFilter
      }
      if (selectedFilter.length === 0) {
        this.displayErrorMsg('Please select Section', 'danger');
        return;
      }
      console.log(obj);
      this.modal.close(obj);
    });
  }

  displayErrorMsg(message: string, messageType: string): void {
    this.alertMsg = { message, messageType, duration: Constants.ALERT_DURATION };
  }

  searchSection() {
    if (this.searchString) {
      this.chartDataArray = _.filter(this.chartDataArrayClone, dt => {
        return dt.sectionName.toUpperCase().indexOf(this.searchString.toUpperCase()) > -1;
      });
    } else {
      this.chartDataArray = _.cloneDeep(this.chartDataArrayClone);
    }
  }

  selectAndDeselectAll() {
    _.map(this.chartDataArray, dt => {
      dt.isSelected = this.selectDeselectAll;
    });
  }

  closePopup(typ) {
    const obj = {
      type: typ,
      data: null
    };
    this.modal.close(obj);
  }

}
