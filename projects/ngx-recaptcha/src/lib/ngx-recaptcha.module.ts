import { NgModule } from '@angular/core';
import { NgxRecaptchaComponent } from './ngx-recaptcha.component';
import { RECAPTCHA_SERVICE_PROVIDER } from './ngx-recaptcha.service';

@NgModule({
  declarations: [NgxRecaptchaComponent],
  imports: [
  ],
  exports: [NgxRecaptchaComponent],
  providers: [RECAPTCHA_SERVICE_PROVIDER]
})
export class NgxRecaptchaModule { }
