import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { DynamicChartComponent } from './../dynamic-chart/dynamic-chart/dynamic-chart.component';
import { DynamicChartService } from './../dynamic-chart/dynamic-chart.service';

@Injectable()
export class DeactivateGuard implements CanDeactivate<DynamicChartComponent> {
  constructor(private dynamicChartService: DynamicChartService
  ) {
  }

  canDeactivate(component: DynamicChartComponent, route: ActivatedRouteSnapshot, state: RouterStateSnapshot, nextState?: RouterStateSnapshot): Promise<boolean> | boolean {
    // check if dirty data exist.
    const dirtyDataExist = this.dynamicChartService.checkForSaveDraftData();
    if (!dirtyDataExist) {
      return true;
    }
    return component.canDeactivate(nextState);

    // const ref = fromPromise(this.confirmationModalService.open(AutoSaveConfirmationComponent));

    // return modalInstance.result.then((result) => {
    //   if (result === 'saveDraft') {
    //     this.dynamicChartService.autoSaveChartData().subscribe();
    //     return true;
    //   } else if (result === 'discard') {
    //     return true;
    //   }
    // }, error => {
    //   return false;
    // });
  }
}
