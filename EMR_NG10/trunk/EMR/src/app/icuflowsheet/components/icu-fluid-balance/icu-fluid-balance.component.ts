import { Component, OnInit } from '@angular/core';
import { ConsultationService } from './../../../public/services/consultation.service';
import { NursingReportService } from './../../../public/services/nursing-report.service';

@Component({
  selector: 'app-icu-fluid-balance',
  templateUrl: './icu-fluid-balance.component.html',
  styleUrls: ['./icu-fluid-balance.component.scss']
})
export class IcuFluidBalanceComponent implements OnInit {

  patientId = 0;
  selectedHospitalPatId = 0;
  selectedHospitalPatIpdId = 0;
  intakeTotal = 0;
  intakeDrainTotal = '-';
  intakeUFTotal = '-';
  intakeRTTotal  = 0;
  outputTotal = 0;
  outputDrainTotal = 0;
  outputUFTotal = 0;
  outputRTTotal = 0;
  constructor(
    private consultationService: ConsultationService,
    private nursingReportService: NursingReportService
  ) {
  }

  ngOnInit() {
    this.consultationService.getPatientObj('patientId', true).subscribe(res => {
      this.selectedHospitalPatId = +this.consultationService.getPatientObj('patientId');
      this.selectedHospitalPatIpdId = +this.consultationService.getPatientObj('visitNo');
      const param = {
        hospital_pat_id: this.selectedHospitalPatId,
        ipd_id: this.selectedHospitalPatIpdId
      };
      this.nursingReportService.getNursingReportDates(param).subscribe((result: any) => {
        if (result && result.length) {
          const data = result;
          let countsArr = data['report_data'][0];
          countsArr =  JSON.parse(countsArr['report_total_data']);
          this.intakeTotal = countsArr['intake_total'];
          this.intakeDrainTotal = '-';
          this.intakeUFTotal = '-';
          this.intakeRTTotal = countsArr['intake_rt_feed_qty_total'];
          this.outputTotal = countsArr['output_total'];
          this.outputDrainTotal = countsArr['output_drain_qty_total'];
          this.outputUFTotal = countsArr['output_urine_qty_total'];
          this.outputRTTotal = countsArr['output_r_t_qty_total'];
        }
      });
    });
    // this.rou
  }

}
