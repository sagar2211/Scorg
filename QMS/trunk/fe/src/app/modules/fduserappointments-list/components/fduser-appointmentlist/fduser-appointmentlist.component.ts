import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { QueueService } from 'src/app/modules/qms/services/queue.service';
import { takeUntil } from 'rxjs/operators';
import { Subject, forkJoin } from 'rxjs';
import { QAppointmentDetails } from 'src/app/modules/qms/models/q-entity-appointment-details';
import * as _ from 'lodash';
import { DisplayDataByStatusPipe } from 'src/app/modules/qms/pipes/display-data-by-status.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { IAlert } from 'src/app/models/AlertMessage';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FrontDeskEntityMappingService } from 'src/app/modules/qms/services/front-desk-entity-mapping.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/shared/constants/PermissionsConstants';


@Component({
  selector: 'app-fduser-appointmentlist',
  templateUrl: './fduser-appointmentlist.component.html',
  styleUrls: ['./fduser-appointmentlist.component.scss'],
  providers: [DisplayDataByStatusPipe]

})
export class FduserAppointmentlistComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) public table: DatatableComponent;
  $destroy: Subject<any> = new Subject<any>();
  allEntityAppointmentList = [];
  timeFormateKey = '';
  alertMsg: IAlert;
  userId: number;
  mappedUserList = [];
  providerDetails = null;
  PermissionsConstantsList: any = [];

  constructor(
    private commonService: CommonService,
    private queueService: QueueService,
    private displayDataByStatusPipe: DisplayDataByStatusPipe,
    private authService: AuthService,
    private frontdeskentityMappingService: FrontDeskEntityMappingService,
    private ngxPermissionsService: NgxPermissionsService
  ) { }

  ngOnInit() {
    this.userId = +this.authService.getLoggedInUserId();
    this.providerDetails = {};
    this.providerDetails = this.commonService.getCurrentSelectedProvider();
    this.PermissionsConstantsList = PermissionsConstants;
    const permission = this.ngxPermissionsService.getPermission(PermissionsConstants.View_Access_All_Appointments);
    this.timeFormateKey = this.authService.getUserInfoFromLocalStorage().timeFormat; // res[0].time_format_key;
    this.getAllMappingUserList();
    if (!this.providerDetails && permission === undefined) {
      this.getAppointmentList();
    }
  }

  getAllMappingUserList() {
    this.frontdeskentityMappingService.getMappingDetailsById(this.userId).subscribe((res) => {
      if (res.UserDetails.length && res.UserDetails[0].userMappingResponseViewModelList.length) {
        this.mappedUserList = res.UserDetails[0].userMappingResponseViewModelList;
        _.map(this.mappedUserList, (o) => {
          o.displayMapUserName = o.entityTypeValueName + '(' + o.entityTypeName + ')';
        });
      }
    });
  }

  getAppointmentList() {
    this.queueService.getAllEntityAppointment(this.userId).pipe(takeUntil(this.$destroy)).subscribe((res: Array<QAppointmentDetails>) => {
      if (res.length) {
        this.allEntityAppointmentList = [];
        res.forEach(el => {
          const convertedDataList = this.commonService.convertAppointmentDataToFlatList(el.slotsDetails, this.timeFormateKey, el.entityTag, el.entityValueName, el.entityId, el.entityValueId);
          this.allEntityAppointmentList = _.concat(this.allEntityAppointmentList, convertedDataList);
        });

        this.allEntityAppointmentList = this.displayDataByStatusPipe.transform(this.allEntityAppointmentList, true, ['NEXT', 'SKIP', 'CALLING', 'COMPLETE'], true, true);
      } else {
        this.allEntityAppointmentList = [];
      }
    });
  }

}
