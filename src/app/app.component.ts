import { Component, ViewChild } from '@angular/core';
import { NgxRecaptchaComponent } from 'projects/ngx-recaptcha/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ngx-recaptcha-app';

  captchaType: string

  captchaValueInvisible: string
  captchaValueVisible: string
  captchaValueCustom: string
  script_url_invisible: string = ''//'https://blog.angular.io'
  script_url_visible: string = ''//'https://blog.angular.io'
  script_url_custom: string = 'assets/custom-captcha.js'

  @ViewChild('captchaInvisible') captchaInvisible: NgxRecaptchaComponent
  @ViewChild('captchaVisible') captchaVisible: NgxRecaptchaComponent
  @ViewChild('captchaCustom') captchaCustom: NgxRecaptchaComponent


  showURLInputs = false

  callback(type: string, event: any) {
    console.log('CAPTCHA (invisible) ' + type + '::', event)
    if (type === 'loaded' && this.captchaInvisible.size === 'invisible') {
      console.log('CAPTCHA (invisible) -execute ' + type + '::', event)
      this.captchaInvisible.execute()
    } else if (type === 'response') {
      this.captchaValueInvisible = event
    } else if (type === 'error') {
      this.captchaValueInvisible = JSON.stringify(event, null, 2)
    }
  }
  callback2(type: string, event: any) {
    console.log('CAPTCHA (visible) ' + type + '::', event)
    if (type === 'loaded' && this.captchaVisible.size === 'invisible') {
      this.captchaVisible.execute()
    } else if (type === 'response') {
      this.captchaValueVisible = event
    } else if (type === 'error') {
      this.captchaValueVisible = JSON.stringify(event, null, 2)
    }
  }
  callback3(type: string, event: any) {
    console.log('CAPTCHA (custom) ' + type + '::', event)
    if (type === 'loaded' && this.captchaCustom.size === 'invisible') {
      this.captchaCustom.execute()
    } else if (type === 'response') {
      this.captchaValueCustom = event
    } else if (type === 'error') {
      this.captchaValueCustom = JSON.stringify(event, null, 2)
    }
  }

  reset1() {
    this.captchaInvisible.reset()
    this.captchaValueInvisible = ''
  }
  reset2() {
    this.captchaVisible.reset()
    this.captchaValueVisible = ''
  }
  reset3() {
    this.captchaCustom.reset()
    this.captchaValueCustom = ''
  }

  captchaTypeChange(newValue) {
    const previousValue = this.captchaType
    console.log('captchaTypeChange', previousValue, newValue)
    this.captchaType = newValue
    switch (previousValue) {
      case 'invisible':
        this.reset1()
        this.captchaInvisible.clear()
        break
      case 'visible':
        this.reset2()
        this.captchaVisible.clear()
        break
      case 'custom':
        this.reset3()
        this.captchaCustom.clear()
        break
      default:
        break
    }
    if(false)
    switch (this.captchaType) {
      case 'invisible':
        this.captchaInvisible.init()
        break
      case 'visible':
        this.captchaVisible.init()
        break
      case 'custom':
        this.captchaCustom.init()
        break
      default:
        break
    }
  }
}
