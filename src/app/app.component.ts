import { Component, ViewChild } from '@angular/core';
import { NgxRecaptchaComponent } from 'projects/ngx-recaptcha/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ngx-recaptcha-app';

  captchaValue: string
  script_url: string ='https://blog.angular.io'

  @ViewChild(NgxRecaptchaComponent, { static: false }) captcha: NgxRecaptchaComponent

  callback(type: string, event: any) {
    console.log(type + '::', event)
    if (type === 'loaded' && this.captcha.size === 'invisible') {
      this.captcha.execute()
    } else if (type === 'response') {
      this.captchaValue = event
    } else if (type === 'error') {
      this.captchaValue = JSON.stringify(event, null, 2)
    }
  }
}
