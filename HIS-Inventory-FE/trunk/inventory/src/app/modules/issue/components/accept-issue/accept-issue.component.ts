import { Component, OnInit } from '@angular/core';
import {IssueService} from '../../services/issue.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonService} from '../../../../public/services/common.service';
import * as _ from 'lodash';
import {Constants} from '../../../../config/constants';
import {PermissionsConstants} from '../../../../config/PermissionsConstants';
@Component({
  selector: 'app-accept-issue',
  templateUrl: './accept-issue.component.html',
  styleUrls: ['./accept-issue.component.scss']
})
export class AcceptIssueComponent implements OnInit {
  issueId: number;
  issueDetails: any;
  alertMsg: any;
  constpermissionList: any = [];
  constructor(
    private issueService: IssueService,
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.issueId = +this.route.snapshot.params.id;
    if (this.issueId && this.issueId > -1) {
      // get details and patch values
      this.getIssueById();
    }
    this.commonService.routeChanged(this.route);
    this.constpermissionList = PermissionsConstants;
  }

  getIssueById(): void {
    this.issueService.getIssueById(this.issueId, false).subscribe((res: any) => {
      this.issueDetails = res;
      _.map(this.issueDetails.issueDetailList, (o) => {
        o.acceptedQty = this.issueDetails.issueStatus === 'Open' ? o.issueQty : o.acceptedQty;
      });
    });
  }

  manageAcceptRejectQty(item, typeChanged): void{
    if (typeChanged === 'accept_changed') {
      if (+item.issueQty < +item.acceptedQty) {
        item.acceptedQty = +item.issueQty;
      } else if (+item.acceptedQty < 0) {
        item.acceptedQty = 0;
      }

      item.rejectedQty = +item.issueQty - (+item.acceptedQty);
    } else {
      item.acceptedQty = +item.issueQty - (+item.rejectedQty);
    }
  }

  acceptIssue(): void {
    const reqParams = this.prepareRequestData();
    this.issueService.IssueAcceptance(reqParams).subscribe((res: any) => {
      if (res) {
        this.alertMsg = {
          message: res.message,
          messageType: 'success',
          duration: Constants.ALERT_DURATION
        };
        this.router.navigate(['/inventory/issue/issueAcceptanceList']);
      }
    });
  }

  prepareRequestData(): any {
    const reqParams = {
      issueId: this.issueDetails.issueId,
      issueItemList: []
    };
    _.forEach(this.issueDetails.issueDetailList, (o) => {
      const obj = {
        id: o.id,
        itemId: o.itemId,
        acceptedQty: o.acceptedQty,
        rejectedQty: o.rejectedQty
      };
      reqParams.issueItemList.push(obj);
    });
    return reqParams;
  }

  cancel(): void {
    this.router.navigate(['/inventory/issue/issueAcceptanceList']);
  }
}
