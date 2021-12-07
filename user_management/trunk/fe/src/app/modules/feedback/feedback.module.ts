import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FeedbackHomeComponent } from './components/feedback-home/feedback-home.component';
import { PatientFeedbackComponent } from './components/patient-feedback/patient-feedback.component';


const feedbackRoutes: Routes = [
  {
    path: '', component: FeedbackHomeComponent,
    children: [
      {
        path: '', redirectTo: 'patintFeedback', pathMatch: 'full'
      },
      {
        path: 'patintFeedback',
        component: PatientFeedbackComponent,
        data: {
          displayName: 'Patent Feedback',
        }
      }
    ]
  }];


@NgModule({
  declarations: [
    FeedbackHomeComponent,
    PatientFeedbackComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(feedbackRoutes),
    SharedModule
  ]
})
export class FeedbackModule { }
