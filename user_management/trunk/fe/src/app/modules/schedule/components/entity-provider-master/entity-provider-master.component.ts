import { ScheduleMakerService } from './../../services/schedule-maker.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EntitityCommonDataService } from '../../services/entitity-common-data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from 'src/app/components/confirmation-popup/confirmation-popup.component';
import { Router, ActivatedRoute } from '@angular/router';
import { IAlert } from 'src/app/models/AlertMessage';
import { CommonService } from '../../../../services/common.service';
import { Constants } from 'src/app/config/constants';
import { fadeInOut } from 'src/app/config/animations';
import * as _ from 'lodash';

@Component({
  selector: 'app-entity-provider-master',
  templateUrl: './entity-provider-master.component.html',
  styleUrls: ['./entity-provider-master.component.scss'],
  animations: [
    fadeInOut
  ],
})
export class EntityProviderMasterComponent implements OnInit, OnDestroy {
  currentSection = 'section1';
  boxShadow = false;
  alertMsg: IAlert;
  destroy$ = new Subject();
  lastAppointmentData = null;

  constructor(
    private entityCommonDataService: EntitityCommonDataService,
    private confirmationModalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private scheduleMakerService: ScheduleMakerService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.lastAppointmentData = null
    this.commonService.routeChanged(this.route);
    this.subcriptionOfEvents();
  }

  scrollTo(section) {
    document.querySelector('#' + section)
      .scrollIntoView();
    this.onSectionChange(section);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
    this.boxShadow = true;
    // switch (sectionId) {
    //   case 'section1':
    //     this.loadTab('addPrivileges');
    //     break;
    //   case 'section2':
    //     this.loadTab('addPrivileges');
    //     break;
    //   case 'section3':
    //     this.loadTab('docAssigment');
    //     break;
    // }

  }

  saveEntityInstructionData() {
    if (this.entityCommonDataService.entityScheduleObject.basicInfo.selectedEntity
      && this.entityCommonDataService.entityScheduleObject.basicInfo.selectedProvider) {
      const messageDetails = {
        modalTitle: 'Confirm',
        modalBody: 'Do you want to save all data?'
      };
      const modalInstance = this.confirmationModalService.open(ConfirmationPopupComponent, {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then((result) => {
        if (result !== 'Ok') {

        } else {
          this.saveAllEntityScheduleData();
        }
      }, (reason) => {

      });
      modalInstance.componentInstance.messageDetails = messageDetails;
    } else {
      if (!this.entityCommonDataService.entityScheduleObject.basicInfo.selectedEntity) {
        this.alertMsg = {
          message: 'Please Select Entity',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      } else if (!this.entityCommonDataService.entityScheduleObject.basicInfo.selectedProvider) {
        this.alertMsg = {
          message: 'Please Select Provider',
          messageType: 'warning',
          duration: Constants.ALERT_DURATION
        };
      }
    }
  }

  saveAllEntityScheduleData() {
    this.entityCommonDataService.saveAllEntityData().subscribe(res => {
      if (res.status) {
        this.alertMsg = {
          message: res.msg,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.entityCommonDataService.historyData = {};
        setTimeout(() => {
          this.router.navigate(['/app/qms/schedule/activeScheduleList']);
        }, 1000);
      } else {
        if (res.msg) {
          this.alertMsg = {
            message: res.msg,
            messageType: 'warning',
            duration: Constants.ALERT_DURATION
          };
        }
      }
    });
  }

  subcriptionOfEvents() {
    this.entityCommonDataService.$subcBasicInforServiceProviderChangeGetHistory
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (!_.isEmpty(data)) {
          const param = {
            entity_id: data.basicInfo.selectedEntity.id,
            entity_data_id: data.basicInfo.selectedProvider.id
          };
          this.scheduleMakerService.getLastAppointmentData(param).subscribe(res => {
            this.lastAppointmentData = res.Last_Appointment;
          })
        } else {
          this.lastAppointmentData = null
        }
      });
    this.entityCommonDataService.$subcGetServicesListDataOnProviderSelect
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        const stepBasicInfoData = data;
        const param = {
          entity_id: stepBasicInfoData.entity_id,
          entity_data_id: stepBasicInfoData.entity_data_id
        };
        this.scheduleMakerService.getLastAppointmentData(param).subscribe(res => {
          this.lastAppointmentData = res.Last_Appointment;
        })
      });
  }

}
