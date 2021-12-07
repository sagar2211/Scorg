import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-ot-home',
  templateUrl: './ot-home.component.html',
  styleUrls: ['./ot-home.component.scss']
})
export class OtHomeComponent implements OnInit {
  constructor(
    public router: Router,
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {

  }

}
