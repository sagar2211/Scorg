import { filter } from 'rxjs/operators';
import { CustomEventsService } from './../../../../services/custom-events.service';
import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-display-queue-template3',
  templateUrl: './display-queue-template3.component.html',
  styleUrls: ['./display-queue-template3.component.scss']
})
export class DisplayQueueTemplate3Component implements OnInit {
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

  getHeight(key, section?): string {
    switch (key) {
      case 'name':
        if (!this.checkUserKeyExist('doctor', 'speciality') && !this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-100 mh-100 align-items-center';
        } else if (this.checkUserKeyExist('doctor', 'speciality') && !this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-mh-50';
        } else if (this.checkUserKeyExist('doctor', 'speciality') && !this.checkUserKeyExist('doctor', 'room_list') && this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-mh-30';
        } else if (!this.checkUserKeyExist('doctor', 'speciality') && this.checkUserKeyExist('doctor', 'room_list') && this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-mh-40 align-items-center';
        } else if (this.checkUserKeyExist('doctor', 'speciality') && this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-mh-40';
        } else if (!this.checkUserKeyExist('doctor', 'speciality') && this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-mh-80 align-items-center';
        } else if (!this.checkUserKeyExist('doctor', 'speciality') && !this.checkUserKeyExist('doctor', 'room_list') && this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-mh-60 align-items-center';
        }

        break;

      case 'speciality':
        if (this.checkUserKeyExist('doctor', 'name') && this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-mh-40';
        } else if (this.checkUserKeyExist('doctor', 'name') && !this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-mh-50';
        } else if (!this.checkUserKeyExist('doctor', 'name') && !this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-100 mh-100 align-items-center';
        } else if (!this.checkUserKeyExist('doctor', 'name') && this.checkUserKeyExist('doctor', 'room_list') && this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-mh-40 align-items-center';
        } else if (!this.checkUserKeyExist('doctor', 'name') && this.checkUserKeyExist('doctor', 'room_list') && !this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-mh-80 align-items-center';
        } else if (!this.checkUserKeyExist('doctor', 'name') && !this.checkUserKeyExist('doctor', 'room_list') && this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-mh-60 align-items-center';
        } else if (this.checkUserKeyExist('doctor', 'name') && !this.checkUserKeyExist('doctor', 'room_list') && this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-mh-30';
        }

        break;
      case 'room_list':
        if (!this.checkUserKeyExist('doctor', 'name') && !this.checkUserKeyExist('doctor', 'speciality') && !this.checkUserKeyExist('doctor', 'profile_image')) {
          return 'h-100 mh-100';
        }

        break;
      case 'profile_image':
        if (!this.checkUserKeyExist('doctor', 'name') && !this.checkUserKeyExist('doctor', 'speciality') && !this.checkUserKeyExist('doctor', 'room_list')) {
          return 'h-100 mh-100';
        } else if (!this.checkUserKeyExist('doctor', 'name') && !this.checkUserKeyExist('doctor', 'speciality') && this.checkUserKeyExist('doctor', 'room_list')) {
          return 'h-mh-80';
        }
        break;
    }
    return '';
  }
  getFillteredList(list, filterBy) {
    return list.filter(r => r.status === filterBy);
  }
}
