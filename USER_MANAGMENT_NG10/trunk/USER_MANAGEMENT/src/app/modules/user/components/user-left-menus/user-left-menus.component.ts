import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { Constants } from 'src/app/config/constants';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { AuthService } from 'src/app/public/services/auth.service';
import { CommonService } from 'src/app/public/services/common.service';
import { SideMenuService } from 'src/app/public/services/sidemenu.service';
import { UsersService } from 'src/app/public/services/users.service';

@Component({
  selector: 'app-user-left-menus',
  templateUrl: './user-left-menus.component.html',
  styleUrls: ['./user-left-menus.component.scss']
})
export class UserLeftMenusComponent implements OnInit, OnChanges {

  @Input() toggle: boolean;
  isActiveClass: boolean;
  sideBarArray = [];
  favouriteMenusList: Array<any> = [];
  settingKey: string;
  userInfo = null;
  permissionsConstants: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private commonService: CommonService,
    private userService: UsersService,
    private sideMenuService: SideMenuService,
  ) {
    this.permissionsConstants = commonService.permissionsConstants;

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isActiveClass = (event.url === '/app/user/mapping/doctormapping' || event.url === '/app/user/mappning/mappeddoctorlist') ? true : false;
        this.checkCurrentActive();
      }
    });
  }

  ngOnInit() {
    this.sideBarArray = this.sideMenuService.sideMenuList;
    this.settingKey = Constants.DEFAULT_LANDING_PAGE;
    this.userInfo = this.authService.getUserInfoFromLocalStorage();
    this.commonService.getQueueSettings(this.settingKey, this.userInfo.user_id).subscribe(res => {
      if (res) {
        this.favouriteMenusList = res;
        this.favouriteMenusList.forEach((fav: any) => {
          const i = this.sideBarArray.findIndex(r => r.linkKey === fav.parentMenu && fav.masterModule === 'user');
          if (i !== -1) {
            this.sideBarArray[i].children.forEach(e => {
              const childKey = fav.favouriteRouteUrl.split('/')[2];
              if (e.linkKey === childKey) {
                e.isFavourite = true;
              } else {
                e.isFavourite = false;
              }
            });
          }
        });
      }
    });
    this.checkCurrentActive();
  }

  ngOnChanges() {
    this.toggle = this.toggle;
  }

  // checkCurrentActive() {
  //   const splitUrl = this.router.url.split('/')[this.router.url.split('/').length - 1];
  //   _.map(this.sideBarArray, (v) => {
  //     _.map(v.children, (child) => {
  //       if (splitUrl === child.linkKey) {
  //         child.isActive = true;
  //       } else {
  //         child.isActive = false;
  //       }
  //     });
  //   });
  // }

  checkCurrentActive() {
    const spiltCoutnt = Object.keys(this.route.snapshot.firstChild.params).length + 1;
    const splitUrl = this.router.url.split('/')[this.router.url.split('/').length - spiltCoutnt];
    _.map(this.sideBarArray, (v) => {
      v.isActive = false;
      _.map(v.children, (child) => {
        const localKey = child.linkKey.split('/')[child.linkKey.split('/').length - 1];
        if (splitUrl === localKey) {
          child.isActive = true;
          v.isActive = true;
        } else {
          child.isActive = false;
        }
      });
    });
  }

  saveFavourite(parentItem, childItem, $event): void {
    $event.stopPropagation();
    parentItem.children.forEach(c => {
      c.isFavourite = false;
    });
    childItem.isFavourite = true;
    const indx = this.favouriteMenusList.findIndex(f => f.parentMenu === parentItem.linkKey && f.masterModule === 'user');
    if (indx !== -1) {
      this.favouriteMenusList[indx].favouriteRouteUrl = 'app/user/' + childItem.linkKey;
    } else {
      this.favouriteMenusList.push({
        masterModule: 'user',
        parentMenu: parentItem.linkKey,
        favouriteRouteUrl: 'app/user/' + childItem.linkKey
      });
    }
    this.commonService.SaveQueueSettings(this.settingKey, JSON.stringify(this.favouriteMenusList), this.userInfo.user_id).subscribe();
  }

  onMenuClick(parentUrl): void {
    const indx = this.favouriteMenusList.findIndex(f => f.parentMenu === parentUrl.linkKey && f.masterModule === 'user');
    // check user has permission or not of fav. menu
    if (indx !== -1) {
      const userPermissions = [...this.userService.userPermission];
      const menuList = _.find(this.sideBarArray, (o) => { return o.linkKey == this.favouriteMenusList[indx].parentMenu; });
      const subMenu = menuList ? _.find(menuList.children, (o) => { return this.favouriteMenusList[indx].favouriteRouteUrl.endsWith('app/user/' + o.linkKey) }) : undefined;
      if (subMenu) {
        let permission = _.find(userPermissions, (o) => { return o == subMenu.permission; })
        if (permission)
          this.router.navigate([this.favouriteMenusList[indx].favouriteRouteUrl]);
      } else {
        this.router.navigate([this.favouriteMenusList[indx].favouriteRouteUrl]);
      }
    }
  }

}
