import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CustomEventsService {

    // -- display list color change events
    public mastDisplayActiveColor = '';
    public displayActiveColor: Subject<string> = new Subject<string>();
    public $recDisplayActiveColor = this.displayActiveColor.asObservable();

    constructor() { }

    sendDisplayColor(color) {
        this.mastDisplayActiveColor = color;
        this.displayActiveColor.next(color);
    }

}
