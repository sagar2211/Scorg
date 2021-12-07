import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { Doctor } from '../../models/doctor.model';
import { Entity } from '../../models/entity.model';
import { EntityBasicInfoService } from '../../services/entity-basic-info.service';
import { IAlert } from 'src/app/models/AlertMessage';

@Component({
  selector: 'app-joint-clinic-modal',
  templateUrl: './joint-clinic-modal.component.html',
  styleUrls: ['./joint-clinic-modal.component.scss']
})
export class JointClinicModalComponent implements OnInit {
  jointClinicForm: FormGroup;
  doctorList: Array<Doctor> = [];
  alertMsg: IAlert;
  entityList: Entity[] = [];
  mode = 'NEW';

  @Input() selectedClinic: any;
  @Input() selectedClinicDocList: Array<Doctor>;

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private entityBasicInfoService: EntityBasicInfoService,
  ) { }

  ngOnInit() {
    this.createForm();
    this.getAllEntityList();
    if (this.selectedClinic) {
      this.mode = 'EDIT';
      this.jointClinicForm.patchValue({
        jointClinicName: this.selectedClinic.name,
        selectedDoctors: this.selectedClinicDocList
      });
      this.jointClinicForm.get('jointClinicName').disable();
    } else {
      this.mode = 'NEW';
    }
  }

  createForm() {
    this.patchDefaultValue();
  }

  patchDefaultValue(data?) {
    this.jointClinicForm = this.fb.group({
      jointClinicName: [null, Validators.required],
      selectedDoctors: [null, Validators.required]
    });
  }

  getAllEntityList() {
    this.entityBasicInfoService.getAllEntityList().subscribe(res => {
      if (res.length > 0) {
        this.entityList = res;
      } else {
        this.alertMsg = {
          message: 'no entity data',
          messageType: 'warning',
          duration: 3000
        };
      }
      this.getAllDoctorList();
    });
  }

  getAllDoctorList(searchKey?) {
    const params = {
      limit: 100000,
      search_text: searchKey ? searchKey : '',
      id: _.find(this.entityList, (v) => {
        return v.key === 'doctor' ? v.id : null;
      })['id'],
      speciality_id: null
    };
    this.entityBasicInfoService.getAllServiceProviderList(params).subscribe(res => {
      if (res.length > 0) {
        this.doctorList = [];
        _.map(res, (val, key) => {
          const doctor = new Doctor();
          if (doctor.isObjectValid(val)) {
            doctor.generateObject(val);
            this.doctorList.push(doctor);
          }
        });
      } else {
        this.alertMsg = {
          message: 'no doctor data',
          messageType: 'warning',
          duration: 3000
        };
      }
      // this.createForm();/
    });
  }

  checkJointClinicNameExist(name) {
    if (name) {
      const param = {
        clinic_name: name
      };
      this.entityBasicInfoService.checkJointClinicNameExist(param).subscribe(res => {
        if (res.toLowerCase() === 'yes') {
          this.jointClinicForm.controls['jointClinicName'].setValue(null);
          this.alertMsg = {
            message: 'Name Already Exist',
            messageType: 'warning',
            duration: 3000
          };
        }
      });
    }
  }

}
