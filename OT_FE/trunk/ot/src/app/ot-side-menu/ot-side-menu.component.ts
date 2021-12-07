import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from '../public/services/auth.service';
import { CommonService } from '../public/services/common.service';
import { Constants } from '../config/constants';
import * as _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { PermissionsConstants } from '../config/PermissionsConstants';
import { SideMenuService } from '../public/services/sidemenu.service';

@Component({
  selector: 'app-ot-side-menu',
  templateUrl: './ot-side-menu.component.html',
  styleUrls: ['./ot-side-menu.component.scss']
})
export class OtSideMenuComponent implements OnInit, OnDestroy {

  sideBarArray = [];
  userInfo: any;
  settingKey = '';
  favouriteMenusList: Array<any> = [];
  showHideMenu: any;
  destroy$ = new Subject<any>();
  showMenuType = 'fixed'
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private commonService: CommonService,
    private sideMenuService: SideMenuService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkCurrentActive();
      }
    });
  }

  ngOnInit(): void {
    this.showHideMenu = false;
    this.settingKey = Constants.DEFAULT_LANDING_PAGE;
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.updateSideMenuList();
    this.queueSetting();
    this.subcriptionOfEvents();
    this.checkCurrentActive();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  checkCurrentActive(): void {
    const spiltCoutnt = 1;

    const isAnyParentActive = !!(_.find(this.sideBarArray, (o) => o.isActive === true));
    const splitUrl = this.router.url; //this.router.url.split('/')[this.router.url.split('/').length - spiltCoutnt];
    _.map(this.sideBarArray, (v) => {
      // v.isActive = (isAnyParentActive) ? v.isActive : false;
      _.map(v.children, (child) => {
        const localKey = child.linkKey.split('/')[child.linkKey.split('/').length - 1];
        if (splitUrl.indexOf(child.linkKey) !== -1) {
          child.isActive = true;
          v.isActive = (isAnyParentActive) ? v.isActive : true;
        } else {
          child.isActive = false;
        }
      });
    });
  }

  updateParentActive(index) {
    _.map(this.sideBarArray, (v) => {
      v.isActive = false;
    });
    this.sideBarArray[index].isActive = true;
    this.showHideMenu = !this.showHideMenu;
    this.commonService.showHideMainMenuReverse(this.showHideMenu);
  }

  saveFavourite(parentItem, childItem, $event): void {
    $event.stopPropagation();
    parentItem.children.forEach(c => {
      c.isFavourite = false;
    });
    childItem.isFavourite = true;
    const indx = this.favouriteMenusList.findIndex(f => f.parentMenu === parentItem.linkKey && f.masterModule === 'otApp');
    if (indx !== -1) {
      this.favouriteMenusList[indx].favouriteRouteUrl = 'otApp/' + childItem.linkKey;
    } else {
      this.favouriteMenusList.push({
        masterModule: 'otApp',
        parentMenu: parentItem.linkKey,
        favouriteRouteUrl: 'otApp/' + childItem.linkKey
      });
    }
    this.commonService.SaveQueueSettings(this.settingKey, JSON.stringify(this.favouriteMenusList), this.userInfo.user_id).subscribe();
  }

  onMenuClick(parentUrl): void {
    const indx = this.favouriteMenusList.findIndex(f => f.parentMenu === parentUrl.linkKey && f.masterModule === 'otApp');
    // check user has permission or not of fav. menu
    if (indx !== -1) {
      const userPermissions = [...this.commonService.userPermission];
      const menuList = _.find(this.sideBarArray, (o) => {
        return o.linkKey === this.favouriteMenusList[indx].parentMenu;
      });
      const subMenu = menuList ? _.find(menuList.children, (o) => {
        return this.favouriteMenusList[indx].favouriteRouteUrl.endsWith(o.linkKey)
      }) : undefined;
      if (subMenu) {
        const permission = _.find(userPermissions, (o) => {
          return o === subMenu.permission;
        });
        if (permission) {
          this.router.navigate([this.favouriteMenusList[indx].favouriteRouteUrl]);
        }
      } else {
        this.router.navigate([this.favouriteMenusList[indx].favouriteRouteUrl]);
      }
      this.showHideMenu = !this.showHideMenu;
      this.commonService.showHideMainMenuReverse(this.showHideMenu);
    }
  }

  subcriptionOfEvents() {
    this.commonService.$menushowHide.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.showHideMenu = data;
    });
  }

  queueSetting() {
    this.commonService.getQueueSettings(this.settingKey, this.userInfo.user_id).subscribe(res => {
      if (res) {
        this.favouriteMenusList = res;
        this.favouriteMenusList.forEach((fav: any) => {
          const i = this.sideBarArray.findIndex(r => r.linkKey === fav.parentMenu && fav.masterModule === 'otApp');
          if (i !== -1) {
            this.sideBarArray[i].children.forEach(e => {
              const childKey = fav.favouriteRouteUrl.split('/')[fav.favouriteRouteUrl.split('/').length - 1];
              const localKey = e.linkKey.split('/')[e.linkKey.split('/').length - 1];
              if (localKey === childKey) {
                e.isFavourite = true;
              } else {
                e.isFavourite = false;
              }
            });
          } else {

          }
        });
      }
    });
  }

  updateSideMenuList() {
    this.sideBarArray = this.sideMenuService.sideMenuList;
  }

}
