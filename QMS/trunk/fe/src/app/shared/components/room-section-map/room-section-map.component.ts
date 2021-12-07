import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { IAlert } from 'src/app/models/AlertMessage';
import { Observable } from 'rxjs';
import { } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { fadeInOut } from 'src/app/config/animations';
import { Room } from 'src/app/modules/qms/models/room.model';
import { Section } from 'src/app/modules/qms/models/section.model';
import { RoomMasterService } from 'src/app/modules/qms/services/room-master.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-room-section-map',
  templateUrl: './room-section-map.component.html',
  styleUrls: ['./room-section-map.component.scss'],
  animations: [
    fadeInOut
  ],
})
export class RoomSectionMapComponent implements OnInit {
  @Input() mapData;
  @Output() hideMapSection = new EventEmitter<any>();
  mapListForm: FormGroup;
  loadForm: boolean;
  alertMsg: IAlert;
  roomsList: Room[] = [];
  isNgSelectTypeHeadDisabled: boolean;
  editMode: boolean;
  isChanged: boolean;
  selectedSection: Section;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private router: Router,
    private roomMasterService: RoomMasterService,
  ) { }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
    this.isNgSelectTypeHeadDisabled = false;
    this.editMode = false;
    this.loadForm = false;
    this.isChanged = false;
    if (!_.isEmpty(this.mapData)) {
      this.editMode = true;
      this.createForm();
      this.generateEditData(this.mapData);
    } else {
      this.createForm();
    }
  }

  generateEditData(val) {
    const sectionData = {
      id: val.id,
      name: val.name,
      isActive: true,
      displaySetting: null,
      remark: null
    };
    const section = new Section();
    section.generateObject(sectionData);
    this.selectedSection = section;
    this.patchDefaultValue(this.selectedSection);
    this.getRoomListData(this.selectedSection, 0);
  }

  createForm() {
    this.mapListForm = this.fb.group({
      roomSecMap: this.fb.array([])
    });
    if (!this.editMode) {
      this.patchDefaultValue();
    }
  }

  get roomSecMap() {
    return this.mapListForm.get('roomSecMap') as FormArray;
  }

  patchDefaultValue(val?) {
    const mapForm = {
      section: [val ? val : null, Validators.required],
      roomList: [null, Validators.required],
      formId: [null],
      displaySetting: [null],
      isChanged: false
    };
    this.roomSecMap.push(this.fb.group(mapForm));
    this.loadForm = true;
  }


  getRoomSectionMappingData(id, sectionId): Observable<any> {
    return this.roomMasterService.getRoomSectionMappingData(id, sectionId).pipe(map(res => {
      return res;
    }));
  }

  selectSection(e, index) {
    if (!_.isEmpty(e)) {
      const check = this.checkIfExistInSelected(e, index);
      if (check.exist) {
        this.alertMsg = {
          message: 'Already Selected',
          messageType: 'warning',
          duration: 3000
        };
        this.roomSecMap.controls[index].patchValue({ section: null });
        this.roomSecMap.controls[index].patchValue({ isChanged: true });
        this.isChanged = true;
      } else {
        this.roomSecMap.controls[index].patchValue({ section: e });
        this.roomSecMap.controls[index].patchValue({ isChanged: false });
        this.isChanged = false;
        this.getRoomListData(e, index);
      }
    } else {
      this.roomSecMap.controls[index].patchValue({ section: null });
      this.roomSecMap.controls[index].patchValue({ roomList: [] });
      this.roomSecMap.controls[index].patchValue({ formId: null });
      this.roomSecMap.controls[index].patchValue({ isChanged: true });
      this.isChanged = false;
    }
  }

  updateSelectedRoomList(e, index) {
    if (_.isEmpty(e)) {
      this.roomSecMap.controls[index].patchValue({ roomList: null });
    } else {
      this.roomSecMap.controls[index].patchValue({ roomList: e.roomVal });
    }

  }

  addNewSection() {
    this.patchDefaultValue();
  }

  deleteSection(index) {
    this.roomSecMap.removeAt(index);
    if (this.roomSecMap.controls.length <= 0) {
      this.patchDefaultValue();
    }
  }

  getRoomListData(data, index) {
    this.getRoomSectionMappingData(0, data.id).subscribe(res => {
      if (!_.isEmpty(res)) {
        this.roomSecMap.controls[index].patchValue({ roomList: res.roomData });
        this.roomSecMap.controls[index].patchValue({ formId: res.formId });
      }
    });
  }

  checkIfExistInSelected(e, index) {
    let checkExist = false;
    let existIndex = null;
    const formVal = (this.mapListForm.value).roomSecMap;
    _.map(formVal, (v, i) => {
      if (!checkExist && v.section && v.section.id === e.id && index !== i) {
        checkExist = true;
        existIndex = i;
      }
    });
    return { exist: checkExist, atIndex: existIndex };
  }

  getSaveData() {
    const data = [];
    let isSectionListEmpty = false;
    let isRoomListEmpty = false;
    const formVal = (this.mapListForm.value).roomSecMap;
    _.map(formVal, (v, i) => {
      if (!_.isEmpty(v.section) && !_.isEmpty(v.roomList) && v.roomList.length > 0) {
        data.push(v);
      } else {
        isSectionListEmpty = _.isEmpty(v.section);
        isRoomListEmpty = (_.isEmpty(v.roomList) || !v.roomList.length);
      }
    });
    return { data, isSectionListEmpty, isRoomListEmpty };
  }

  saveMappingData() {
    const mappingData = this.getSaveData();
    const param = mappingData.data;
    if (param.length > 0 && !mappingData.isSectionListEmpty && !mappingData.isRoomListEmpty) {
      this.roomMasterService.saveRoomSectionMapping(param).subscribe(res => {
        if (res) {
          if (this.editMode) {
            this.alertMsg = {
              message: 'Mapping Updated Successfully',
              messageType: 'success',
              duration: 3000
            };
          } else {
            this.alertMsg = {
              message: 'Successfully Mapped',
              messageType: 'success',
              duration: 3000
            };
          }
          this.redirectTolist(res);
        } else {
          this.alertMsg = {
            message: 'Something went Wrong',
            messageType: 'warning',
            duration: 3000
          };
        }
      });
    } else {
      const message = (mappingData.isSectionListEmpty) ? 'Please Select Section' : 'Please Select Room';
      this.alertMsg = {
        message: message,
        messageType: 'warning',
        duration: 3000
      };
    }

  }

  redirectTolist(sectionMapped?) {
    this.hideMapSection.emit({ sectionMapped, isHide: true, alertMsg: this.alertMsg });
    setTimeout(() => {
      this.router.navigate(['/app/qms/roomSection/roomSectionMapList']);
    }, 1000);
  }

  checkEmpty(val) {
    return _.isEmpty(val);
  }

}
