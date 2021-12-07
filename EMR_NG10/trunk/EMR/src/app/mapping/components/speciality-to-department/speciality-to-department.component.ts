import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/public/services/common.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-speciality-to-department',
  templateUrl: './speciality-to-department.component.html',
  styleUrls: ['./speciality-to-department.component.scss']
})
export class SpecialityToDepartmentComponent implements OnInit {

  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) {  }

  ngOnInit() {
    this.commonService.routeChanged(this.route);
  }

}
