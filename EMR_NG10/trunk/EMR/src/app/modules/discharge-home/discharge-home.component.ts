import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/public/services/auth.service';

@Component({
  selector: 'app-discharge-home',
  templateUrl: './discharge-home.component.html',
  styleUrls: ['./discharge-home.component.scss']
})
export class DischargeHomeComponent implements OnInit {

  constructor(
    private authService: AuthService,
  ) {   }

  ngOnInit(): void {
    this.authService.setActiveAppKey('DISCHARGE');
    localStorage.setItem('loginFor', JSON.stringify('DISCHARGE'));
  }

}
