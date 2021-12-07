import { Component, OnInit } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { UsersService } from '../public/services/users.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { takeUntil } from 'rxjs/operators';
import { PermissionsConstants } from '../config/PermissionsConstants';
import * as _ from 'lodash';
import { CommonService } from '../public/services/common.service';
import { AuthService } from '../public/services/auth.service';

@Component({
  selector: 'app-inventory-home',
  templateUrl: './inventory-home.component.html',
  styleUrls: ['./inventory-home.component.scss']
})
export class InventoryHomeComponent implements OnInit {
  userMenuToggleValue = false;
  subscription: Subscription;
  isExistPreviousUrl: boolean = false;
  destroy$ = new Subject();
  hideMiniNav: boolean;
  constructor(
    public router: Router,
    private userService: UsersService,
    private commonService: CommonService,
    private authService: AuthService,
    private ngxPermissionsService: NgxPermissionsService
  ) {
    this.subscription = this.userService.getCollapseValue().subscribe(res => {
      this.userMenuToggleValue = res.collapseValue;
    });
  }

  ngOnInit() {
    // If user not select default then ask for select store
    const storeId = this.authService.getLoginStoreId();
    if(!storeId){
      this.router.navigate(['/selectStore']);
    }
    this.hideMiniNav = false;
    this.userService.$subcIsFromProfileEditSubject.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.isExistPreviousUrl = ((data.isFromProfileEdit &&
        (_.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.View_UserMaster)) &&
          _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.View_Mapped_Doctor_List))
        ))) ? true : false;
    });
  }

  ngOnDestroy() {
    // unsubscribe
    this.subscription.unsubscribe();
  }

  appOutSideClickEvent(event) {
    if (event && this.commonService.isOpen) {
      this.commonService.toggle(undefined);
    }
  }

}
