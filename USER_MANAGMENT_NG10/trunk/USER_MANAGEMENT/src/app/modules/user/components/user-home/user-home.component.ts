import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { UsersService } from 'src/app/public/services/users.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit {
  userMenuToggleValue = false;
  subscription: Subscription;
  isExistPreviousUrl: boolean = false;
  destroy$ = new Subject();
  constructor(
    public router: Router,
    private userService: UsersService,
    private ngxPermissionsService: NgxPermissionsService
  ) {
    this.subscription = this.userService.getCollapseValue().subscribe(res => {
      this.userMenuToggleValue = res.collapseValue;
    });
  }

  ngOnInit() {
    // add no-left-side class
    this.userService.$subcIsFromProfileEditSubject.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.isExistPreviousUrl = ((data.isFromProfileEdit &&
        (_.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.View_UserMaster)) &&
          _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.View_Mapped_Doctor_List)) &&
          _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.View_RoleMaster)) &&
          _.isUndefined(this.ngxPermissionsService.getPermission(PermissionsConstants.View_RolePermission))
        ))) ? true : false;
    });
  }

  ngOnDestroy() {
    // unsubscribe
    this.subscription.unsubscribe();
  }

}
