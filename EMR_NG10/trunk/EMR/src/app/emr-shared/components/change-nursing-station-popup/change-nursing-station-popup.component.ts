import { Component, Input, OnInit } from '@angular/core';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { AuthService } from 'src/app/public/services/auth.service';
import * as _ from 'lodash';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-change-nursing-station-popup',
  templateUrl: './change-nursing-station-popup.component.html',
  styleUrls: ['./change-nursing-station-popup.component.scss']
})
export class ChangeNursingStationPopupComponent implements OnInit {
  @Input() stationArrayFiltered: any;
  selectedNursingStation: any;
  nursingStation: any;
  alertMsg: IAlert;
  constructor(
    private authService: AuthService,
    public modal: NgbActiveModal,) { }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfoFromLocalStorage();
    this.nursingStation = {
      nursingStationId: userInfo.nursingStationId,
      nursingStationName: userInfo.nursingStationName
    };
    this.selectedNursingStation = userInfo.nursingStationName;
  }

  changeStore(): void {
    if (this.nursingStation.nursingStationId === this.selectedNursingStation.nursingStationId) {
      this.alertMsg = {
        message: 'This Store Is Already Selected!',
        messageType: 'danger',
        duration: Constants.ALERT_DURATION
      };
      return;
    } else {
      this.nursingStation = _.cloneDeep(this.selectedNursingStation);
      this.authService.setNursingStationDetails(this.nursingStation);
      this.alertMsg = {
        message: 'Nursing Station Changed Successfully!',
        messageType: 'success',
        duration: Constants.ALERT_DURATION
      };
      window.location.reload();
    }
  }

}
