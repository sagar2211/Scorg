import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IAlert } from '../models/AlertMessage';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-default-landing-selection',
  templateUrl: './default-landing-selection.component.html',
  styleUrls: ['./default-landing-selection.component.scss']
})
export class DefaultLandingSelectionComponent implements OnInit {

  @Input() userId: number;
  @Input() appId: number;
  @Input() selectedPermission;
  alertMsg: IAlert;
  permissionList = [];
  loadList = false;
  landingPermission = null;
  constructor(
    public modal: NgbActiveModal,
    private userService: UsersService,
  ) { }

  ngOnInit(): void {
    if (this.appId) {
      if (this.selectedPermission) {
        this.landingPermission = {
          permission_name: this.selectedPermission.name,
          permission_id: this.selectedPermission.id
        }
      }
      this.getPermissionList();
    }
  }

  getPermissionList() {
    this.userService.getPrimaryPermissionByAppId(this.appId).subscribe(res => {
      this.loadList = true;
      this.permissionList = res;
    })
  }

  saveLanding() {
    if (this.landingPermission) {
      const param = {
        userId: this.userId,
        appId: this.appId,
        permissionId: this.landingPermission.permission_id
      }
      this.userService.changeUserAppLandingPage(param).subscribe(res => {
        this.closeModel('save', res);
      });
    }
  }

  closeModel(type, data) {
    const obj = {
      type: type,
      data: data
    }
    this.modal.close(obj);
  }

}
