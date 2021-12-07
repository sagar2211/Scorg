import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from '../public/services/auth.service';
import { CommonService } from '../public/services/common.service';
import { Constants } from '../config/constants';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { SideMenuService } from '../public/services/sidemenu.service';

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit, OnDestroy {
  @Input() showMenuType;

  sideBarArray = [];
  userInfo: any;
  settingKey = '';
  favouriteMenusList: Array<any> = [];
  showHideMenu: boolean;
  destroy$ = new Subject<any>();

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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  checkCurrentActive(): void {
    const spiltCoutnt = 1;
    const isAnyParentActive = !!(_.find(this.sideBarArray, (o) => o.isActive === true));
    const splitUrl = this.router.url.split('/')[this.router.url.split('/').length - spiltCoutnt];
    _.map(this.sideBarArray, (v) => {
      v.isActive = (isAnyParentActive) ? v.isActive : false;
      _.map(v.children, (child) => {
        const localKey = child.linkKey.split('/')[child.linkKey.split('/').length - 1];
        if (splitUrl === localKey) {
          child.isActive = true;
          v.isActive = (isAnyParentActive) ? v.isActive : true;
        } else {
          child.isActive = false;
        }
      });
    });
  }

  updateParentActive(index): void {
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
    const indx = this.favouriteMenusList.findIndex(f => f.parentMenu === parentItem.linkKey && f.masterModule === 'emr');
    if (indx !== -1) {
      this.favouriteMenusList[indx].favouriteRouteUrl = childItem.linkKey;
    } else {
      this.favouriteMenusList.push({
        masterModule: 'inventory',
        parentMenu: parentItem.linkKey,
        favouriteRouteUrl: childItem.linkKey
      });
    }
    this.commonService.SaveQueueSettings(this.settingKey, JSON.stringify(this.favouriteMenusList), this.userInfo.user_id).subscribe();
  }

  onMenuClick(parentUrl): void {
    const indx = this.favouriteMenusList.findIndex(f => f.parentMenu === parentUrl.linkKey && f.masterModule === 'qms');
    // check user has permission or not of fav. menu
    if (indx !== -1) {
      const userPermissions = [...this.commonService.userPermission];
      const menuList = _.find(this.sideBarArray, (o) => {
        return o.linkKey === this.favouriteMenusList[indx].parentMenu;
      });
      const subMenu = menuList ? _.find(menuList.children, (o) => {
        return this.favouriteMenusList[indx].favouriteRouteUrl.endsWith(o.linkKey);
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

  subcriptionOfEvents(): void {
    this.commonService.$menushowHide.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.showHideMenu = !this.showHideMenu;
    });
  }

  queueSetting(): void {
    this.commonService.getQueueSettings(this.settingKey, this.userInfo.user_id).subscribe(res => {
      if (res) {
        this.favouriteMenusList = res;
        this.favouriteMenusList.forEach((fav: any) => {
          const i = this.sideBarArray.findIndex(r => r.linkKey === fav.parentMenu && fav.masterModule === 'inventory');
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

  updateSideMenuList(): void {
    this.sideBarArray = this.sideMenuService.sideMenuList;
  }
}
