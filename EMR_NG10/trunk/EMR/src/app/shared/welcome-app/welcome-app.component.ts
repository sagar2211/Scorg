import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome-app',
  templateUrl: './welcome-app.component.html',
  styleUrls: ['./welcome-app.component.scss']
})
export class WelcomeAppComponent implements OnInit {

  @Input() source = 'emr'; //emr/appointment/nursing/emr-setting
  constructor() { }

  ngOnInit(): void {
  }

}
