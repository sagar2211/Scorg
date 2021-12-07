import { Directive, AfterContentChecked, ChangeDetectorRef, DoCheck } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[ngx-resize-watcher]'
})
export class NgxResizeWatcherDirectiveDirective implements AfterContentChecked {

  constructor(
    private table: DatatableComponent,
    public ref: ChangeDetectorRef
  ) { }
  private latestWidth: number;

  ngAfterContentChecked() {
    setTimeout(() => {
      if (this.table && this.table.element.clientWidth !== this.latestWidth) {
        this.latestWidth = this.table.element.clientWidth;
        this.table.recalculate();
        this.ref.markForCheck();
      }
    });
  }
}
