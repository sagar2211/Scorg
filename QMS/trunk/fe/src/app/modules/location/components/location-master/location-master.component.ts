import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {IAlert} from '../../../../models/AlertMessage';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Constants} from '../../../../config/constants';
import * as _ from  'lodash';
import { LocationMasterService } from 'src/app/modules/qms/services/location-master.service';
@Component({
  selector: 'app-location-master',
  templateUrl: './location-master.component.html',
  styleUrls: ['./location-master.component.scss']
})
export class LocationMasterComponent implements OnInit {

  @Input() locationData;
  @Output() hideLocationSection = new EventEmitter<any>();
  locationForm: FormGroup;
  loadForm: boolean;
  alertMsg: IAlert;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private locationMasterService: LocationMasterService,
  ) { }

  ngOnInit() {
    this.loadForm = false;
    if (_.isEmpty(this.locationData)) {
      this.createForm();
    } else {
      this.createForm(this.locationData);
    }
  }

  createForm(form?) {
    this.patchDefaultValue(form);
  }

  patchDefaultValue(val?) {
    const form = {
      id: [val && val.id ? val.id : null],
      name: [val && val.name ? val.name : null, Validators.required],
      isActive: true
    };
    this.locationForm = this.fb.group(form);
    this.loadForm = true;
  }

  saveLocationMasterData() {
    console.log(this.locationForm.value);
    if (_.isEmpty(_.trim(this.locationForm.value.name))) {
      this.alertMsg = {
        message: 'Please Check Values',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
    } else {
      this.locationMasterService.saveLocationMasterData(this.locationForm.value).subscribe(res => {
        if (res) {
          this.alertMsg = {
            message: 'Location added successfully!',
            messageType: 'success',
            duration: Constants.ALERT_DURATION
          };
          this.redirectToLocationList(res);
        } else {
          this.alertMsg = {
            message: 'Location not Saved Please try again!',
            messageType: 'warning',
            duration: Constants.ALERT_DURATION
          };
        }
      });
    }
  }

  redirectToLocationList(addedLocationInMaster?) {
    this.hideLocationSection.emit({ locationAdded: addedLocationInMaster, isHide: true, alertMsg: this.alertMsg });
  }


}
