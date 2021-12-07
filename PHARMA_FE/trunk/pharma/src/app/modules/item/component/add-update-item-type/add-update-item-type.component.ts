import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/config/constants';
import { MastersService } from 'src/app/modules/masters/services/masters.service';

@Component({
  selector: 'app-add-update-item-type',
  templateUrl: './add-update-item-type.component.html',
  styleUrls: ['./add-update-item-type.component.scss']
})
export class AddUpdateItemTypeComponent implements OnInit {
  @Input() supplierData: any;
  itemTypeForm: FormGroup;
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
      id: [val && val.itemTypeId ? val.itemTypeId : null],
      desc: [val && val.itemTypeDesc ? val.itemTypeDesc : null, Validators.required],
      isActive: [val && val.isActive !== null ? val.isActive : true, Validators.required]
    };
    this.itemTypeForm = this.fb.group(form);
    this.loadForm = true;
  }

  saveItemTypeMasterData() {
    this.submitted = true;
    if (this.itemTypeForm.valid && this.submitted) {
      const formVal = this.itemTypeForm.value;
      const param = {
        itemTypeId: formVal.id ? formVal.id : 0,
        itemTypeDesc: formVal.desc,
        isActive: formVal.isActive
      };
      this.mastersService.saveItemTypeMaster(param).subscribe(res => {
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

  get itemFormControl() {
    return this.itemTypeForm.controls;
  }

}
