import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { PublicService } from 'src/app/public/services/public.service';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-patient-refer',
  templateUrl: './patient-refer.component.html',
  styleUrls: ['./patient-refer.component.scss']
})
export class PatientReferComponent implements OnInit {
  careTeamFrm: FormGroup;
  patientId: any;
  isAdd = false;
  compInstance = this;
  loginUser: any;
  specilityArray: string[] = ['Andrology', 'Ayurved', 'Cardiac Arrhythmia', 'Cardiology', 'Dermetology', 'ENT'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public publicService: PublicService,
    public authService: AuthService,
    public modal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.loginUser = this.authService.getUserDetailsByKey('userInfo');
    this.patientId = this.route.snapshot.paramMap.get('patientId');
    this.createForm();
    this.getCareTeamData();
  }

  createForm() {
    this.careTeamFrm = this.fb.group({
      doctorListArray: this.fb.array([])
    });
  }

  patchDefaultValue(): void {
    const userObj = {
      name: null,
      id: null,
      speciality: null
    };
    userObj.name = [null, Validators.required];
    userObj.id = [null];
    userObj.speciality = [null];
    this.doctorListArray.push(this.fb.group(userObj));
  }

  get doctorListArray() {
    return this.careTeamFrm.get('doctorListArray') as FormArray;
  }

  addDoctor(rowData): void {
    this.isAdd = true;
    if (rowData.valid) {
      this.isAdd = false;
      this.patchDefaultValue();
    }
    this.updateValueInService();
  }

  deleteDoctor(indx): void {
    this.doctorListArray.removeAt(indx);
    if (this.doctorListArray.controls.length <= 0) {
      this.patchDefaultValue();
    }
  }



  getAllUserList(searchKey): Observable<any> {
    return this.compInstance.publicService.getAllLocationAndUsers(141).pipe(map(res => {
      res = _.map(res, (v) => {
        v.speciality = this.compInstance.specilityArray[this.compInstance.getRandomInt(5)];
        return v;
      });
      return res;
    }));
  }

  getRandomInt(max) {
    return ((Math.floor(Math.random() * Math.floor(max))) || 1);
  }

  getDoctorName(doc, index): void {
    this.doctorListArray.at(index).patchValue({
      name: typeof doc === 'object' ? doc.name : doc,
      id: typeof doc === 'object' ? doc.id : '',
      speciality: typeof doc === 'object' ? doc.speciality : '',
    });
  }

  getDoctorSpeciality(doc, index): void {
    this.doctorListArray.at(index).patchValue({
      name: typeof doc === 'object' ? doc.name : doc,
      id: typeof doc === 'object' ? doc.id : '',
      speciality: typeof doc === 'object' ? doc.speciality : '',
    });
  }

  getCareTeamData() {
    this.publicService.getReferUserList().subscribe(data => {
      if (data.length) {
        this.careTeamFrm.setControl('doctorListArray', this.fb.array([]));
        this.updateInitialValue(data);
      } else {
        const userObj = [{
          name: Constants.EMR_IPD_USER_DETAILS.doctor_name, // this.loginUser.doctor_name,
          id: Constants.EMR_IPD_USER_DETAILS.docId,
          speciality: Constants.EMR_IPD_USER_DETAILS.specialityInfo
        }];
        this.updateInitialValue(userObj);
      }
    });
  }

  updateInitialValue(data): void {
    _.map(data, (x) => {
      const obj = {
        name: [x['name'], Validators.required],
        id: [x['id']],
        speciality: [x['speciality']],
      };
      this.doctorListArray.push(this.fb.group(obj));
    });
  }

  updateValueInService() {
    const formdata = _.filter(this.doctorListArray.value, (v) => {
      return (v.id !== null && v.id !== '');
    });
    console.log(formdata);
    this.publicService.updateReferUserList(formdata);
  }

}
