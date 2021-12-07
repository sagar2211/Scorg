import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd, ActivationEnd, ActivationStart, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {CommonService} from '../../public/services/common.service';
import * as _ from 'lodash';


@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  activeUrl: string;
  breadCrums: Array<object> = new Array<object>();
  selectedRoute: any;
  showBreadCrum: any;

  relatedBreadcrumb;

  constructor(
    private router: Router,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.relatedBreadcrumb = [];
    if (this.commonService.activatedRouteCopy) {
      this.manageBreadCumbsData(this.commonService.activatedRouteCopy);
    }
    this.subscription = this.commonService.$activatedRouteChange.subscribe((obj: ActivatedRoute) => {
      this.manageBreadCumbsData(obj);
      // const routeData = { displayName: '', routeLink: '', params: {} };
      // routeData.params = obj.snapshot.params;
      // routeData.displayName = (obj.snapshot.data && obj.snapshot.data.breadCrumInfo) ? obj.snapshot.data.breadCrumInfo.display : '';
      // routeData.routeLink = (obj.snapshot.data && obj.snapshot.data.breadCrumInfo) ? obj.snapshot.data.breadCrumInfo.route : '';
      // this.breadCrums.push(routeData);
      // if (this.breadCrums.length > 2) {
      //   this.breadCrums.splice(0, 1);
      // }
      // this.showBreadCrum = _.reverse(_.cloneDeep(this.breadCrums));
      // this.selectedRoute = this.showBreadCrum[0].displayName;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  routeTo(breadcrumb: any) {
    this.selectedRoute = breadcrumb.displayName;
    let navRoute = breadcrumb.routeLink;
    Object.keys(breadcrumb.params).map((param) => {
      navRoute += '/' + breadcrumb.params[param];
    });
    this.router.navigate([navRoute], { queryParams: {} });
  }

  manageBreadCumbsData(obj: ActivatedRoute) {
    const routeData = { displayName: '', routeLink: '', params: {} };
    routeData.params = obj.snapshot.params;
    routeData.displayName = (obj.snapshot.data && obj.snapshot.data.breadCrumInfo) ? obj.snapshot.data.breadCrumInfo.display : '';
    routeData.routeLink = (obj.snapshot.data && obj.snapshot.data.breadCrumInfo) ? obj.snapshot.data.breadCrumInfo.route : '';
    this.breadCrums.push(routeData);
    if (this.breadCrums.length > 2) {
      this.breadCrums.splice(0, 1);
    }
    this.showBreadCrum = _.reverse(_.cloneDeep(this.breadCrums));
    this.selectedRoute = this.showBreadCrum[0].displayName;
    this.relatedBreadcrumb = [];
    const relatedBCrumb = (obj.snapshot.data && obj.snapshot.data.relatedLinks) ? obj.snapshot.data.relatedLinks : [];
    if (this.showBreadCrum.length > 1){
      let index = relatedBCrumb.findIndex(visitedUrl => visitedUrl.displayName === this.showBreadCrum[1].displayName);
      if ( index !== -1){
        this.relatedBreadcrumb.splice(index,1);
      }
    }
  }

  routeToRelatedBreadCrumb(breadcrumb: any) {
    this.router.navigate([breadcrumb.routeLink]);
  }

}
