import { CalendarUtils } from 'angular-calendar';
import { GetWeekViewArgs, WeekView } from 'calendar-utils';
import * as _ from 'lodash';

export class CustomCalendarUtils extends CalendarUtils {

  getWeekView(args: GetWeekViewArgs): WeekView {
    const view = super.getWeekView(args);
    const eventsInOneRow: Array<{
      row: number, origionalWidth: number, events: Array<any>
    }> = [];
    let rowIndex = 0;
    if (view.hourColumns.length === 1) {
      view.hourColumns.forEach(column => {
        column.events.forEach((event, index) => {

          if (event.left > 0) {
            const rowEvents = _.find(eventsInOneRow, { row: rowIndex });
            if (!rowEvents) {
              eventsInOneRow.push({
                row: rowIndex,
                origionalWidth: event.width,
                events: [event]
              });
            }
            if (rowEvents) {

              rowEvents.events.push(event);
            }
          } else if (event.left === 0) {
            rowIndex = rowIndex + 1;
          }
          event.width = 15;
        });
      });
      eventsInOneRow.forEach(rowEvent => {
        rowEvent.events.forEach((event) => {
          const leftMargin = ((event.left / rowEvent.origionalWidth) === 0 || (event.left / rowEvent.origionalWidth) < 1) ? 1 : (event.left / rowEvent.origionalWidth);
          event.left = event.width * leftMargin;
        });
      })
    }

    return view;
  }

}