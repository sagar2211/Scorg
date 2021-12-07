import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { IAlert } from 'src/app/models/AlertMessage';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { CommonService } from 'src/app/services/common.service';
import { CalculateAge } from 'src/app/shared/pipes/calculate-age.pipe';
import { EntitySettingsService } from 'src/app/modules/appointment/services/entity-settings.service';


@Component({
  selector: 'app-cancel-holiday-popup',
  templateUrl: './cancel-holiday-popup.component.html',
  styleUrls: ['./cancel-holiday-popup.component.scss'],
  providers: [CalculateAge]
})
export class CancelHolidayPopupComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false })
  table: DatatableComponent;
  alertMsg: IAlert;
  isSendSMS: boolean = true;
  appointmentList: Array<any> = [
    {
      patientId: '123',
      patientName: 'abc xyz',
      age: 25,
      gender: 'Female',
      contact: 9090909090,
      slotTime: '12:90',
      appointmentTime: '22:4325',
      token: 's4f',
      status: 'dfghd'
    }
  ];
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    pageNumber: number,
  };
  totalRecords: number;
  currentPage: number;
  remark: string = '';

  @Input() cancelAppointmentData: any;
  @Input() reqParams: any;
  @Input() timeFormatkey: any;

  constructor(
    private entitySettingsService: EntitySettingsService,
    private modal: NgbActiveModal,
    private commonService: CommonService,
    private CalculateAgepipe: CalculateAge


  ) { }

  ngOnInit() {
    // this.getCancelAppointmentList();
    this.appointmentList = this.cancelAppointmentData;
    this.makeAppoitnmentList();
  }

  makeAppoitnmentList() {
    _.map(this.appointmentList, (v) => {
      v.bookingTime = this.commonService.convertTime(this.timeFormatkey, v.app_time_from);
      v.communicationTime = this.commonService.convertTime(this.timeFormatkey, v.slot_time_from) + '-' +
      this.commonService.convertTime(this.timeFormatkey, (v.slot_time_to === '00:00:00' || v.slot_time_to === '12:00 AM')
      ? '23:59' : v.slot_time_to);
      v.patientAge = v.pat_DOB ? this.CalculateAgepipe.transform(v.pat_DOB) : v.pat_Age + '(' + v.pat_age_unit + ')';
    });
  }

  onSendSMS() {
    if (this.isSendSMS) {
      this.reqParams.send_sms = true;
      this.reqParams.remarks = this.remark;
      this.entitySettingsService.getCancelAppointmentListOfDoctor(this.reqParams).subscribe(response => {
          this.modal.close(response.status_code);
      });
    } else {
      this.modal.close('closed');
    }
  }

  closeModal() {
    this.modal.close('closed');
  }
}
