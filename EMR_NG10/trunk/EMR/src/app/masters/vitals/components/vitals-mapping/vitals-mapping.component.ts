import { Component, OnInit, Input } from '@angular/core';
import { IAlert } from '@qms/qlist-lib/lib/models/common.model';
import { VitalsDataService } from './../../../../public/services/vitals-data.service';
import { Observable, of, forkJoin } from 'rxjs';
import { map, find } from 'rxjs/operators';
import { Constants } from 'src/app/config/constants';
import * as _ from 'lodash';
import { VitalMapped } from './../../../../public/models/vitals';
import { MappingService } from './../../../../public/services/mapping.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-vitals-mapping',
  templateUrl: './vitals-mapping.component.html',
  styleUrls: ['./vitals-mapping.component.scss']
})
export class VitalsMappingComponent implements OnInit {

  vitalMapData = {
    type: 'add',
    data: null
  };
  setAlertMessage: IAlert;
  selectedSpeciality: any;
  selectedServicesType: any;

  compInstance = this;
  vitalDataSelected: any;

  mappedVitalList = [];
  allVitalList = [];
  constructor(
    public vitalsDataService: VitalsDataService,
    public mappingService: MappingService,
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    if (!_.isUndefined(this.route.snapshot.params.specialtyId) && !_.isUndefined(this.route.snapshot.params.serviceTypeId)) {
      this.vitalMapData.type = 'edit';
      const serviceType = this.getAllServiceTypeList(this.route.snapshot.params.serviceTypeId);
      const specialty = this.getSpecialty(this.route.snapshot.params.specialtyId);
      const list = this.getAllVitalList();
      forkJoin([serviceType, specialty, list]).subscribe(res => {
        this.getVitalsListData();
      });
    } else {
      this.vitalMapData.type = 'add';
      this.vitalMapData.data = null;
      this.getAllVitalList().subscribe(res => {
        this.defaultObject();
      });
    }

  }

  setVitalValue() {
    this.getVitalsListData();
  }

  defaultObject() {
    this.selectedSpeciality = null;
    this.selectedServicesType = null;
  }

  selectValueConfirm(typ: string) {
    if (typ === 'Ok') {
      this.saveVitalMappingData().subscribe(res => {
        if (res === true) {
          this.router.navigate(['/emrSettingsApp/settings/vitals/mappingList']);
        } else if (res === false) {
          this.notifyAlertMessage({
            msg: 'Something Went Wrong',
            class: 'danger',
          });
        } else {
          this.notifyAlertMessage({
            msg: 'Please Add Vital',
            class: 'warning',
          });
        }
      });
    } else {
      this.router.navigate(['/emrSettingsApp/settings/vitals/mappingList']);
    }
  }

  getAllServiceTypeList(id): Observable<any> {
    return this.mappingService.getServiceTypeList().pipe(map(res => {
      this.selectedServicesType = _.find(res, dt => {
        return dt.id === _.toNumber(id);
      });
      return this.selectedServicesType;
    }));
  }

  getSpecialty(id): Observable<any> {
    return this.mappingService.getSpecialityById(id).pipe(map(res => {
      this.selectedSpeciality = res;
      return this.selectedSpeciality;
    }));
  }

  saveVitalMappingData(): Observable<any> {
    if (this.mappedVitalList.length > 0) {
      const param = {
        service_type_id: this.selectedServicesType.id,
        speciality_id: this.selectedSpeciality.id,
        vital_data: []
      };
      _.map(this.mappedVitalList, (dt, i) => {
        const obj = {
          id: dt.id,
          vital_id: dt.vital.id,
          sequence: dt.sequence
        };
        param.vital_data.push(_.cloneDeep(obj));
      });
      return this.vitalsDataService.saveVitalMapping(param).pipe(map(res => {
        return res;
      }));
    } else {
      return of(null);
    }
  }

  getSelectedSpeciality(val) {
    this.selectedSpeciality = val;
    this.getVitalsListData();
  }

  getSelectedServiceType(val) {
    this.selectedServicesType = val;
    this.getVitalsListData();
  }

  getVitalsListData() {
    if (this.selectedSpeciality && this.selectedServicesType) {
      const param = {
        service_type_id: this.selectedServicesType.id,
        speciality_id: this.selectedSpeciality.id
      };
      this.vitalsDataService.getVitalMappingListForManageOrder(param).subscribe(res => {
        this.generateMappedVitalList(res);
      });
    } else {
      this.mappedVitalList = [];
    }
  }

  generateMappedVitalList(data) {
    _.map(data, dt => {
      if (dt.vital.clubbedVitalId) {
        dt.isClubbed = true;
        dt.clubbedVital = _.find(this.allVitalList, vtl => {
          return dt.vital.clubbedVitalId === vtl.id;
        });
      }
      if (dt.vital.formulaVitalsId.length > 0) {
        _.map(dt.vital.formulaVitalsId, fid => {
          const checkIndex = _.findIndex(this.mappedVitalList, list => {
            return list.vital.id === fid;
          });
          if (checkIndex !== -1) {
            this.mappedVitalList[checkIndex].isUsedInFormula = true;
          }
        });
      }
    });
    this.mappedVitalList = data;
    this.orderBySequence();
  }

  getAllVitalList(): Observable<any> {
    if (this.compInstance.allVitalList.length > 0) {
      return of(this.compInstance.allVitalList);
    }
    return this.compInstance.vitalsDataService.getAllVitals().pipe(map(res => {
      this.compInstance.allVitalList = res;
      return res;
    }));
  }

  selectVitalValue(val) {
    this.vitalDataSelected = val;
  }

  updateSequence(type, vital, index) {
    if (type === 'up') {
      this.mappedVitalList[index].sequence = vital.sequence - 1;
      this.mappedVitalList[index - 1].sequence = vital.sequence + 1;
    } else if (type === 'down') {
      this.mappedVitalList[index].sequence = vital.sequence + 1;
      this.mappedVitalList[index + 1].sequence = vital.sequence - 1;
    }
    this.orderBySequence();
    this.notifyAlertMessage({
      msg: 'Sequence Updated',
      class: 'success',
    });
  }

  addVitalToMappedList() {
    // check if exist in list or clibbed with vital
    const findIndex = _.findIndex(this.mappedVitalList, dt => {
      return (dt.vital.id === this.vitalDataSelected.id) || (dt.clubbedVital && dt.clubbedVital.id === this.vitalDataSelected.id);
    });
    if (findIndex !== -1) {
      this.notifyAlertMessage({
        msg: 'Alredy Exist',
        class: 'danger',
      });
    } else {
      const obj = {
        id: 0,
        sequence: this.mappedVitalList.length + 1,
        vital: this.vitalDataSelected,
        clubbedVital: null,
        isClubbed: false,
        isUsedInFormula: false,
      };
      if (this.vitalDataSelected.clubbedVitalId) {
        obj.isClubbed = true;
        obj.clubbedVital = _.find(this.allVitalList, dt => {
          return dt.id === this.vitalDataSelected.clubbedVitalId;
        });
      }
      const vtlMpd = new VitalMapped();
      vtlMpd.generateObject(obj);
      this.mappedVitalList.push(vtlMpd);
      this.addFormulaVitalsList();
      this.notifyAlertMessage({
        msg: 'Vital Added',
        class: 'success',
      });
    }
    this.vitalDataSelected = null;
    this.orderBySequence();
  }

  addFormulaVitalsList() {
    if (this.vitalDataSelected.formulaVitalsId.length > 0) {
      _.map(this.vitalDataSelected.formulaVitalsId, id => {
        const vitalData = _.find(this.allVitalList, dt => {
          return dt.id === id && dt.id !== this.vitalDataSelected.id;
        });
        if (vitalData) {
          const checkIfExistAlredy = _.findIndex(this.mappedVitalList, dt => {
            return (dt.vital.id === vitalData.id) || (dt.clubbedVital && dt.clubbedVital.id === vitalData.id);
          });
          if (checkIfExistAlredy === -1) {
            const forObj = {
              id: 0,
              sequence: this.mappedVitalList.length + 1,
              vital: vitalData,
              clubbedVital: null,
              isClubbed: false,
              isUsedInFormula: true,
            };
            const vtlMpd = new VitalMapped();
            vtlMpd.generateObject(forObj);
            this.mappedVitalList.push(_.cloneDeep(vtlMpd));
          }
        }
      });
    }
  }

  deleteVitalToMappedList(vital, index) {
    _.map(this.mappedVitalList, (dt, i) => {
      if (i > index) {
        this.mappedVitalList[i].sequence = this.mappedVitalList[i].sequence - 1;
      }
    });
    this.mappedVitalList.splice(index, 1);
    this.checkAndDeleteForFormula(vital);
    this.notifyAlertMessage({
      msg: 'Vital Removed',
      class: 'success',
    });
    this.orderBySequence();
  }

  checkAndDeleteForFormula(vital) {
    if (vital.vital.formulaVitalsId.length > 0) {
      _.map(vital.vital.formulaVitalsId, id => {
        const vitalDataIndex = _.findIndex(this.mappedVitalList, dt => {
          return dt.vital.id === id;
        });
        if (vitalDataIndex !== -1) {
          _.map(this.mappedVitalList, (dt, i) => {
            if (i > vitalDataIndex) {
              this.mappedVitalList[i].sequence = this.mappedVitalList[i].sequence - 1;
            }
          });
          this.mappedVitalList.splice(vitalDataIndex, 1);
        }
      });
    }
  }

  notifyAlertMessage(data): void {
    this.setAlertMessage = {
      message: data.msg,
      messageType: data.class,
      duration: Constants.ALERT_DURATION
    };
  }

  orderBySequence() {
    const listData = _.cloneDeep(this.mappedVitalList);
    this.mappedVitalList = [];
    this.mappedVitalList = _.sortBy(listData, dt => {
      return dt.sequence;
    });
  }

}
