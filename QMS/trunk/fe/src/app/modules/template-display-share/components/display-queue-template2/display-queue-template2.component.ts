import { CustomEventsService } from './../../../../services/custom-events.service';
import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-display-queue-template2',
  templateUrl: './display-queue-template2.component.html',
  styleUrls: ['./display-queue-template2.component.scss']
})
export class DisplayQueueTemplate2Component implements OnInit {
  @Input() displayData;
  @Input() doctorFieldShow;
  @Input() queueFieldShow;
  @Input() nextFieldShow;
  @Input() callingFieldShow;
  @Input() braningSectionVisble;
  activeColor = '';

  constructor(
    private eventsService: CustomEventsService
  ) { }

  ngOnInit() {
    this.activeColor = this.eventsService.mastDisplayActiveColor;
    this.eventsService.$recDisplayActiveColor.subscribe(res => {
      this.activeColor = res;
    });
  }

  checkUserKeyExist(type, key) {
    let data = [];
    if (type === 'doctor') {
      data = this.doctorFieldShow;
    } else if (type === 'queue') {
      data = this.queueFieldShow;
    } else if (type === 'next') {
      data = this.nextFieldShow;
    } else if (type === 'calling') {
      data = this.callingFieldShow;
    }
    return this.checkKeyExist(data, key);
  }

  checkKeyExist(data, key) {
    const findKey = _.findIndex(data, (k) => {
      return k === key;
    });
    if (findKey !== -1) {
      return true;
    } else {
      return false;
    }
  }

  getHeight(key, section): string {
    if (section === 'doctor') {
      switch (key) {
        case 'profile_image':
          if (!this.checkUserKeyExist('doctor', 'speciality') && this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'name')) {
            return 'h-mh-80';
          } else if (!this.checkUserKeyExist('doctor', 'speciality') && !this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'name')) {
            return 'h-100 mh-100';
          }
          break;
        case 'speciality':
          if (!this.checkUserKeyExist('doctor', 'name') && this.checkUserKeyExist('doctor', 'room_list') && this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-mh-40 align-items-center';
          } else if (this.checkUserKeyExist('doctor', 'name') && !this.checkUserKeyExist('doctor', 'room_list') && this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-mh-30 align-items-start';
          } else if (this.checkUserKeyExist('doctor', 'name') && !this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-mh-50 align-items-start';
          } else if (this.checkUserKeyExist('doctor', 'name') && this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-mh-40 align-items-start';
          } else if (!this.checkUserKeyExist('doctor', 'name') && !this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-100 mh-100 align-items-center';
          } else if (!this.checkUserKeyExist('doctor', 'name') && !this.checkUserKeyExist('doctor', 'room_list') && this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-mh-60 align-items-center';
          } else if (!this.checkUserKeyExist('doctor', 'name') && this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-mh-80 align-items-center';
          } else {
            return 'align-items-start';
          }
        case 'room_list':
          if (!this.checkUserKeyExist('doctor', 'name') && !this.checkUserKeyExist('doctor', 'speciality') && !this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-100 mh-100 align-items-center';
          } else {
            return 'align-content-center';
          }
        case 'name':
          if (this.checkUserKeyExist('doctor', 'speciality') && !this.checkUserKeyExist('doctor', 'room_list') && this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-mh-30 align-items-end';
          } else if (!this.checkUserKeyExist('doctor', 'speciality') && !this.checkUserKeyExist('doctor', 'room_list') && this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-mh-60 align-items-center';
          } else if (!this.checkUserKeyExist('doctor', 'speciality') && this.checkUserKeyExist('doctor', 'room_list') && this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-mh-40 align-items-center';
          } else if (!this.checkUserKeyExist('doctor', 'speciality') && !this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-100 mh-100 align-items-center';
          } else if (this.checkUserKeyExist('doctor', 'speciality') && !this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-mh-50 align-items-end';
          } else if (this.checkUserKeyExist('doctor', 'speciality') && this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-mh-40 align-items-end';
          } else if (!this.checkUserKeyExist('doctor', 'speciality') && this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
            return 'h-mh-80 align-items-center';
          } else {
            return 'align-items-end';
          }
      }
      return '';
    } else {
      switch (key) {
        case 'token':
          if (!this.checkUserKeyExist('calling', 'name') && !this.checkUserKeyExist('calling', 'contact') && !this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-100 mh-100';
          } else if (!this.checkUserKeyExist('calling', 'name') && !this.checkUserKeyExist('calling', 'contact') && this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-mh-81';
          }
          break;
        case 'name':
          if (this.checkUserKeyExist('calling', 'token') && !this.checkUserKeyExist('calling', 'contact') && !this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-mh-70 align-items-center';
          } else if (this.checkUserKeyExist('calling', 'token') && this.checkUserKeyExist('calling', 'contact') && !this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-mh-30';
          } else if (this.checkUserKeyExist('calling', 'token') && !this.checkUserKeyExist('calling', 'contact') && this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-mh-51 align-items-center';
          } else if (!this.checkUserKeyExist('calling', 'token') && this.checkUserKeyExist('calling', 'contact') && this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-mh-36';
          } else if (!this.checkUserKeyExist('calling', 'token') && !this.checkUserKeyExist('calling', 'contact') && this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-mh-81 align-items-center';
          } else if (!this.checkUserKeyExist('calling', 'token') && !this.checkUserKeyExist('calling', 'contact') && !this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-100 mh-100 align-items-center';
          } else if (!this.checkUserKeyExist('calling', 'token') && this.checkUserKeyExist('calling', 'contact') && !this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-mh-50';
          }
          break;
        case 'contact':
          if (this.checkUserKeyExist('calling', 'token') && this.checkUserKeyExist('calling', 'name') && !this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-mh-40';
          } else if (this.checkUserKeyExist('calling', 'token') && !this.checkUserKeyExist('calling', 'name') && this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-mh-51 align-items-center';
          } else if (!this.checkUserKeyExist('calling', 'token') && this.checkUserKeyExist('calling', 'name') && this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-mh-45';
          } else if (!this.checkUserKeyExist('calling', 'token') && !this.checkUserKeyExist('calling', 'name') && this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-mh-81 align-items-center';
          } else if (!this.checkUserKeyExist('calling', 'token') && !this.checkUserKeyExist('calling', 'name') && !this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-100 mh-100 align-items-center';
          } else if (!this.checkUserKeyExist('calling', 'token') && this.checkUserKeyExist('calling', 'name') && !this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-mh-50';
          } else if (this.checkUserKeyExist('calling', 'token') && !this.checkUserKeyExist('calling', 'name') && !this.checkUserKeyExist('calling', 'room_name')) {
            return 'h-mh-70 align-items-center';
          }

          break;

        case 'room_name':
          if (!this.checkUserKeyExist('calling', 'token') && !this.checkUserKeyExist('calling', 'name') && !this.checkUserKeyExist('calling', 'contact')) {
            return 'h-100 mh-100 align-items-center';
          }

          break;
      }
      return '';
    }

  }

}
