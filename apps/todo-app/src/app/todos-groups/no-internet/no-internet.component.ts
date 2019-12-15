import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'no-internet',
  styleUrls: ['./no-internet.component.scss'],
  templateUrl: './no-internet.component.html',
})
export class NoInternetComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
