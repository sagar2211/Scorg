import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/public/services/common.service';

@Component({
  selector: 'app-mtp-and-mlc-home',
  templateUrl: './mtp-and-mlc-home.component.html',
  styleUrls: ['./mtp-and-mlc-home.component.scss']
})
export class MtpAndMlcHomeComponent implements OnInit {
  hideNavbar = false;
  constructor(
    private router: Router,
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    if (this.router.url.includes('partialMlc')) {
      this.hideNavbar = true;
      this.commonService.routeChanged(this.route);
    }
  }

}
