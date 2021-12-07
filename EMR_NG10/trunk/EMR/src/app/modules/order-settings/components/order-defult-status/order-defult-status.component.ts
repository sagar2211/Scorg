import { Component, OnInit } from '@angular/core';
import { Constants } from 'src/app/config/constants';
import { IAlert } from 'src/app/public/models/AlertMessage';
import { OrderService } from 'src/app/public/services/order.service';

@Component({
  selector: 'app-order-defult-status',
  templateUrl: './order-defult-status.component.html',
  styleUrls: ['./order-defult-status.component.scss']
})
export class OrderDefultStatusComponent implements OnInit {

  statusSetting = '';
  alertMsg: IAlert;
  constructor(
    private orderService: OrderService
  ) { }
  ngOnInit(): void {
    this.getSettingData();
  }

  getSettingData() {
    const param = {
      patient_id: "0",
      opd_id: "0",
      user_id: "0",
      date: null,
      key: [Constants.orderStatusDefaultKey],
    };
    this.orderService.getKeyWiseData(param).subscribe(res => {
      if (res.length > 0) {
        this.statusSetting = res[0].value;
      }
    });
  }

  updateParamValue(): void {
    if(!this.statusSetting){
      this.alertMsg = {
        message: 'Select Setting!',
        messageType: 'warning',
        duration: Constants.ALERT_DURATION
      };
      return;
    }
    const param = {
      patient_id: "0",
      opd_id: "0",
      date: null,
      key: Constants.orderStatusDefaultKey,
      value: this.statusSetting,
      user_id: "0",
    };
    this.orderService.saveKeyWiseData(param).subscribe(res => {
      // console.log(res);
      this.alertMsg = {
        message: 'Setting Updated Successfully.',
        messageType: 'success',
        duration: Constants.ALERT_DURATION
      };
    });
  }

}
