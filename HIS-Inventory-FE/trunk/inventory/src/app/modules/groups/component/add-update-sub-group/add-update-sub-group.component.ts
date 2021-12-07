import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/config/constants';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MastersService } from 'src/app/modules/masters/services/masters.service';

@Component({
  selector: 'app-add-update-sub-group',
  templateUrl: './add-update-sub-group.component.html',
  styleUrls: ['./add-update-sub-group.component.scss']
})
export class AddUpdateSubGroupComponent implements OnInit {
  @Input() supplierData: any;
  subGrpForm: FormGroup;
  loadForm: boolean;
  alertMsg: IAlert;
  searchString = '';
  grpListAll = [];
  grpList$ = new Observable<any>();
  submitted = false;

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private mastersService: MastersService,
  ) { }

  ngOnInit(): void {
    this.loadForm = false;
    this.getGroupBySearchKeyword();
    if (this.supplierData) {
      this.createForm(this.supplierData.supplierData);
    } else {
      this.createForm();
    }
  }

  createForm(form?) {
    this.patchDefaultValue(form);
  }

  patchDefaultValue(val?) {
    let obj = null;
    if (val) {
      obj = {
        id: val.groupId,
        name: val.groupName,
        aliasName: null,
        isActive: true
      };
    }
    const form = {
      id: [val && val.subGroupId ? val.subGroupId : null],
      mainGrp: [val && val.groupId ? obj : null, Validators.required],
      name: [val && val.subGroupDesc ? val.subGroupDesc : null, Validators.required],
      aliasName: [val && val.aliasName ? val.aliasName : null],
      assetCode: [val && val.assetCode ? val.assetCode : null],
      depreciationPercent: [val && val.depreciationPercent ? val.depreciationPercent : null],
      isActive: [val && val.isActive !== null ? val.isActive : true, Validators.required]
    };
    this.subGrpForm = this.fb.group(form);
    this.loadForm = true;
  }

  saveValue() {
    this.submitted = true;
    if (this.subGrpForm.valid && this.submitted) {
      const formVal = this.subGrpForm.value;
      const param = {
        groupId: formVal.mainGrp ? formVal.mainGrp.id : null,
        subGroupId: formVal.id ? formVal.id : 0,
        subGroupDesc: formVal.name,
        aliasName: formVal.aliasName,
        assetCode: formVal.assetCode,
        depreciationPercent: formVal.depreciationPercent,
        isActive: formVal.isActive,
      };
      this.mastersService.saveSubGroupMaster(param).subscribe(res => {
        if (res) {
          this.modal.close(formVal.id ? 'save' : 'edit');
        } else {
          this.alertMsg = {
            message: 'Not Saved Please try again!',
            messageType: 'warning',
            duration: Constants.ALERT_DURATION
          };
        }
      });
    }
  }

  getGroupBySearchKeyword(keyword?) {
    const param = {
      searchKeyword: keyword ? keyword : null
    };
    this.grpList$ = this.mastersService.getGroupBySearchKeyword(param).pipe(map(res => {
      this.grpListAll = res;
      return this.grpListAll;
    }));
  }

  onMainGrpChange(grp) {
    // console.log(grp);
  }

  get grpFormControl() {
    return this.subGrpForm.controls;
  }

}
