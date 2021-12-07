import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/config/constants';
import { MastersService } from 'src/app/modules/masters/services/masters.service';

@Component({
  selector: 'app-add-update-main-group',
  templateUrl: './add-update-main-group.component.html',
  styleUrls: ['./add-update-main-group.component.scss']
})
export class AddUpdateMainGroupComponent implements OnInit {
  @Input() supplierData: any;
  grpForm: FormGroup;
  loadForm: boolean;
  alertMsg: IAlert;
  searchString = '';
  submitted = false;

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private mastersService: MastersService,
  ) { }

  ngOnInit(): void {
    this.loadForm = false;
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
    const form = {
      id: [val && val.groupId ? val.groupId : null],
      name: [val && val.groupDesc ? val.groupDesc : null, Validators.required],
      aliasName: [val && val.aliasName ? val.aliasName : null],
      isActive: [val && val.isActive !== null ? val.isActive : true, Validators.required]
    };
    this.grpForm = this.fb.group(form);
    this.loadForm = true;
  }

  saveValue() {
    this.submitted = true;
    if (this.grpForm.valid && this.submitted) {
      const formVal = this.grpForm.value;
      const param = {
        groupId: formVal.id ? formVal.id : 0,
        groupDesc: formVal.name,
        aliasName: formVal.aliasName,
        isActive: formVal.isActive,
      };
      this.mastersService.saveMainGroupMaster(param).subscribe(res => {
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

  get grpFormControl() {
    return this.grpForm.controls;
  }

}
