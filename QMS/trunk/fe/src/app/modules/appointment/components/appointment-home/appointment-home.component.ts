import { Component, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from 'src/app/services/auth.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-appointment-home',
  templateUrl: './appointment-home.component.html',
  styleUrls: ['./appointment-home.component.scss']
})
export class AppointmentHomeComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private ngxPermissionsService: NgxPermissionsService,
  ) { }

  ngOnInit() {
    this.authService.setActiveAppKey('appointment');
    localStorage.setItem('loginFor', JSON.stringify('appointment'));
    this.ngxPermissionsService.loadPermissions(this.userService.userPermission);
  }

}
