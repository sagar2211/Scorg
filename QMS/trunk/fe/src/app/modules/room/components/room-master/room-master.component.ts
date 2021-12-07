import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { IAlert } from 'src/app/models/AlertMessage';
import { Constants } from 'src/app/config/constants';
import { RoomMasterService } from 'src/app/modules/qms/services/room-master.service';
import { LocationMasterService } from 'src/app/modules/qms/services/location-master.service';
import { LocationModel } from 'src/app/modules/qms/models/location.model';

@Component({
  selector: 'app-room-master',
  templateUrl: './room-master.component.html',
  styleUrls: ['./room-master.component.scss']
})
export class RoomMasterComponent implements OnInit {
  @Input() roomData;
  @Input() LocationList: LocationModel[] = [];
  @Output() hideRoomSection = new EventEmitter<any>();
  roomForm: FormGroup;
  loadForm: boolean;
  alertMsg: IAlert;
  searchString = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roomMasterService: RoomMasterService,
    private locationMasterService: LocationMasterService
  ) { }

  ngOnInit() {
    this.loadForm = false;
    if (_.isEmpty(this.roomData)) {
      this.createForm();
    } else {
      this.createForm(this.roomData);
    }
  }

  createForm(form?) {
    this.patchDefaultValue(form);
  }

  patchDefaultValue(val?) {
    const form = {
      id: [val && val.id ? val.id : null],
      name: [val && val.name ? val.name : null, Validators.required],
      location: [val && val.locationObj ? val.locationObj : null, Validators.required],
      isActive: [val && val.isActive !== null ? val.isActive : true, Validators.required]
    };
    this.roomForm = this.fb.group(form);
    this.loadForm = true;
  }

  saveRoomMasterData() {
    console.log(this.roomForm.value);
    if (_.isEmpty(_.trim(this.roomForm.value.name)) || _.isEmpty(_.trim(this.roomForm.value.location))) {
      this.alertMsg = {
        message: 'Please Check Values',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
    } else {
      this.roomMasterService.saveRoomMasterData(this.roomForm.value).subscribe(res => {
        if (res) {
          this.alertMsg = {
            message: res,
            messageType: (res === 'Duplicate entry not allowed') ? 'warning' : 'success',
            duration: Constants.ALERT_DURATION
          };
          this.redirectToRoomList(res);
        } else {
          this.alertMsg = {
            message: 'Room not Saved Please try again!',
            messageType: 'warning',
            duration: Constants.ALERT_DURATION
          };
        }
      });
    }
  }

  redirectToRoomList(addedRoomInMaster?) {
    this.hideRoomSection.emit({ roomAdded: addedRoomInMaster, isHide: true, alertMsg: this.alertMsg });
  }
}
