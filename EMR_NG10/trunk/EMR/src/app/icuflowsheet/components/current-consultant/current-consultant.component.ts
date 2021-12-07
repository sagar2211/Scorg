import { Component, OnInit } from '@angular/core';
import { PublicService } from './../../../public/services/public.service';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-current-consultant',
  templateUrl: './current-consultant.component.html',
  styleUrls: ['./current-consultant.component.scss']
})
export class CurrentConsultantComponent implements OnInit {
  selectedUser = '';
  constructor(
    private publicService: PublicService,
  ) { }

  ngOnInit() {
    this.getCareTeamData();
  }

  getCareTeamData() {
    this.publicService.getCareTeamUserList().subscribe(data => {
      if (data.length) {
        const user = _.filter(data, (v) => {
          return v.isPrimary === true;
        });
        this.selectedUser = user[0]['name'];
      } else {
        this.selectedUser = Constants.EMR_IPD_USER_DETAILS.doctor_name;
      }
    });
  }

}
