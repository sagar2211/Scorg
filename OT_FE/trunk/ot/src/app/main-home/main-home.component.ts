import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonService } from './../public/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-main-home',
  templateUrl: './main-home.component.html',
  styleUrls: ['./main-home.component.scss']
})
export class MainHomeComponent implements OnInit {
  destroy$ = new Subject<any>();
  showHideMenu: any;
  loading = false;
  globalError = false;
  errorMsgDetails: any;
  modalService: NgbModal;
  islogOut = false;
  isAutoLogout = false;
  // menuState = 'out';

  constructor(
    private commonService: CommonService,
    private router: Router,
    private confirmationModalService: NgbModal) {
    this.modalService = this.confirmationModalService;
  }

  ngOnInit(): void {
    this.showHideMenu = false;
    this.subcriptionOfEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  subcriptionOfEvents(): void {
    this.commonService.$menushowHide.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.showHideMenu = data;
    });
    this.commonService.$menushowHideReverse.pipe(takeUntil(this.destroy$)).subscribe((obj: any) => {
      this.showHideMenu = obj;
    });

  }


}
