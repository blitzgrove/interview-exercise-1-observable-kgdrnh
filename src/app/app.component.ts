import { Component, OnInit } from "@angular/core";

import {
  from,
  fromEvent,
  BehaviorSubject,
  NEVER,
  timer,
  Observable,
  Observer
} from "rxjs";
import { map, concatMap, switchMap, tap } from "rxjs/operators";

export function pauseResume$(
  starterStopper: Observable<boolean>,
  pauser: Observable<boolean>,
  output: Array<any>
): Observable<any> {
  return new Observable((obs: Observer<any>) => {
    let i = 0;
    const stream = starterStopper.pipe(
      switchMap(start => {
        if (start) {
          const final = output.splice(0, i);
          return from(output).pipe(
            concatMap(item => item),
            tap(() => i++)
          );
        }
        i = 0;
        return NEVER;
      })
    );
    const p = pauser.pipe(switchMap(paused => (paused ? NEVER : stream)));

    return p.subscribe({
      next: val => obs.next(val),
      error: err => obs.error(err),
      complete: () => obs.complete()
    });
  });
}

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  pauser$ = new BehaviorSubject<boolean>(false);
  starterStopper$ = new BehaviorSubject<boolean>(false);

  pageClickObservable: Observable<Event> = fromEvent(document, "click");

  ngOnInit(): void {
    const emissionStream = [
      timer(1000).pipe(
        tap(() => {
          console.log("A");
        })
      ),
      timer(1000).pipe(
        tap(() => {
          console.log("BB");
          console.log("10");
        })
      ),
      timer(1000).pipe(
        tap(() => {
          console.log("CCC");
        })
      ),
      timer(1000).pipe(
        tap(() => {
          console.log("DDDD");
          console.log("20");
        })
      ),
      timer(1000).pipe(
        tap(() => {
          console.log("EEEEE");
        })
      ),
      timer(1000).pipe(
        tap(() => {
          console.log("FFFFFF");
          console.log("30");
        })
      )
    ];

    pauseResume$(
      this.starterStopper$,
      this.pauser$,
      emissionStream
    ).subscribe();

    this.pageClickObservable.subscribe({
      next: () => {
        if (this.starterStopper$.value) {
          if (this.pauser$.value) {
            this.pauser$.next(false);
          } else {
            this.pauser$.next(true);
          }
        } else {
          this.starterStopper$.next(true);
        }
      }
    });
  }
}
