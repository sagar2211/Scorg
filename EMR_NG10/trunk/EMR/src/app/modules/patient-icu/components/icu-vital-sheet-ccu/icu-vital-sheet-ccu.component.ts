import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Constants } from 'src/app/config/constants';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-icu-vital-sheet',
  templateUrl: './icu-vital-sheet-ccu.component.html',
  styleUrls: ['./icu-vital-sheet-ccu.component.scss']
})
export class IcuVitalSheetCcuComponent implements OnInit {

  tableArray = [];
  timeArray = [];
  userId: number;
  timeFormateKey: string;
  timeFormate: string;
  userInfo: any;
  constructor(
    private authService: AuthService,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.getTimeFormatKey().then(res => {
      for (let i = 0; i < 24; i++) {
        const time = moment(moment().format('YYYY-MM-DD') + ' ' + '0' + i + ':00').format(this.timeFormate);
        this.timeArray.push(_.cloneDeep(time));
      }
      this.tableArray = [
        {
          colName: 'Vital Parameters',
          isParent: true,
          colSize: 0,
          type: '',
          icon: '',
          colorType: '',
          valueArray: [],
          checkedValue: [],
        },
        {
          colName: 'position',
          isParent: false,
          colSize: 2,
          type: 'text',
          icon: '',
          colorType: 'normal',
          valueArray: [],
          checkedValue: [],
        },
        {
          colName: 'Recal Temp.',
          isParent: false,
          colSize: 1,
          type: 'icon',
          icon: 'dot',
          colorType: 'normal',
          valueArray: [40, 39, 38, 37, 36],
          checkedValue: [],
        },
        {
          colName: 'Skin Temp.',
          isParent: false,
          colSize: 1,
          type: 'icon',
          icon: 'x',
          colorType: 'normal',
          valueArray: [34, 32, 30, 28, 26, 24, 22, 20, 190, 180, 170, 160, 150, 140, 130],
          checkedValue: [],
        },
        {
          colName: 'B/P',
          isParent: false,
          colSize: 1,
          type: 'icon',
          icon: 'x',
          colorType: 'red',
          valueArray: [120, 110, 100, 90, 80, 70],
          checkedValue: [],
        },
        {
          colName: 'Pulse',
          isParent: false,
          colSize: 1,
          type: 'icon',
          icon: 'dot',
          colorType: 'normal',
          valueArray: [60, 50, 40],
          checkedValue: [],
        },
        {
          colName: 'Apex',
          isParent: false,
          colSize: 1,
          type: 'icon',
          icon: 'dot_blank',
          colorType: 'normal',
          valueArray: [30, 28, 26],
          checkedValue: [],
        },
        {
          colName: 'PAP',
          isParent: false,
          colSize: 1,
          type: 'icon',
          icon: 'box_dot',
          colorType: 'normal',
          valueArray: [24, 22, 20, 18],
          checkedValue: [],
        },
        {
          colName: 'Resps',
          isParent: false,
          colSize: 1,
          type: 'icon',
          icon: 'dot_normal',
          colorType: 'normal',
          valueArray: [16, 14, 12, 10],
          checkedValue: [],
        },
        {
          colName: 'Pain',
          isParent: false,
          colSize: 1,
          type: 'icon',
          icon: 'dot',
          colorType: 'normal',
          valueArray: [8],
          checkedValue: [],
        },
        {
          colName: 'PAW',
          isParent: false,
          colSize: 1,
          type: 'icon',
          icon: 'square',
          colorType: 'red',
          valueArray: [6],
          checkedValue: [],
        },
        {
          colName: 'R.A.',
          isParent: false,
          colSize: 1,
          type: 'icon',
          icon: 'dot',
          colorType: 'red',
          valueArray: [4],
          checkedValue: [],
        },
        {
          colName: 'SaO2.',
          isParent: false,
          colSize: 1,
          type: 'text',
          icon: '',
          colorType: 'normal',
          valueArray: [],
          checkedValue: [],
        },
        {
          colName: 'RHYTHM',
          isParent: false,
          colSize: 1,
          type: 'text',
          icon: '',
          colorType: 'normal',
          valueArray: [],
          checkedValue: [],
        },
        {
          colName: 'Ventilator Settings',
          isParent: true,
          colSize: 0,
          type: '',
          icon: '',
          colorType: '',
          valueArray: [],
          checkedValue: [],
        },
        {
          colName: 'E.T. Tube No/Mark',
          isParent: false,
          colSize: 2,
          type: 'text',
          icon: '',
          colorType: 'normal',
          valueArray: [],
          checkedValue: [],
        },
        {
          colName: 'Vent Mode',
          isParent: false,
          colSize: 2,
          type: 'text',
          icon: '',
          colorType: 'normal',
          valueArray: [],
          checkedValue: [],
        },
        {
          colName: 'Fio2%',
          isParent: false,
          colSize: 2,
          type: 'text',
          icon: '',
          colorType: 'normal',
          valueArray: [],
          checkedValue: [],
        },
        {
          colName: 'Peep',
          isParent: false,
          colSize: 2,
          type: 'text',
          icon: '',
          colorType: 'normal',
          valueArray: [],
          checkedValue: [],
        },
        {
          colName: 'Rate',
          isParent: false,
          colSize: 2,
          type: 'text',
          icon: '',
          colorType: 'normal',
          valueArray: [],
          checkedValue: [],
        },
        {
          colName: 'Tidal Volumn',
          isParent: false,
          colSize: 2,
          type: 'text',
          icon: '',
          colorType: 'normal',
          valueArray: [],
          checkedValue: [],
        },
        {
          colName: 'Pressure (Peak)',
          isParent: false,
          colSize: 2,
          type: 'text',
          icon: '',
          colorType: 'normal',
          valueArray: [],
          checkedValue: [],
        },
        {
          colName: 'Sedation Score',
          isParent: false,
          colSize: 2,
          type: 'text',
          icon: '',
          colorType: 'normal',
          valueArray: [],
          checkedValue: [],
        },
      ];
      _.map(this.tableArray, ta => {
        if (ta.type === 'text') {
          _.map(this.timeArray, tm => {
            const obj = {
              time: tm,
              key: '',
              val: null
            };
            ta.checkedValue.push(_.clone(obj));
          });
        }
      });
    });
  }


  updateValue(mainArray, value, time, mIndx) {
    if (mainArray.type !== 'text') {
      const checkExist = _.findIndex(this.tableArray[mIndx].checkedValue, v => {
        return v.time === time && v.key !== '' && v.key === value;
      });
      if (checkExist !== -1) {
        this.tableArray[mIndx].checkedValue.splice(checkExist, 1);
      } else {
        const obj = {
          time: time,
          key: value,
          val: mainArray.icon
        };
        this.tableArray[mIndx].checkedValue.push(obj);
      }
    }
    console.log(mainArray, value, time, mIndx);
    console.log(this.tableArray, 'this.tableArray');
  }

  checkIfhaveSelectedValue(item, value, time, mIndx) {
    const checkExist = _.findIndex(this.tableArray[mIndx].checkedValue, v => {
      return v.time === time && v.key !== '' && v.key === value;
    });
    let retVal = null;
    if (checkExist !== -1) {
      retVal = this.tableArray[mIndx].checkedValue[checkExist].val;
    }
    return retVal;
  }

  getTimeFormatKey(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.userId = +this.authService.getLoggedInUserId();
      this.commonService.getQueueSettings(Constants.timeFormateKey, this.userId).subscribe(res => {
        this.timeFormateKey = res.time_format_key;
        if (this.timeFormateKey === '12_hour') {
          this.timeFormate = 'hh:mm A';
        } else {
          this.timeFormate = 'HH:mm';
        }
        resolve(this.timeFormate);
      });
    });
    return promise;
  }
}
