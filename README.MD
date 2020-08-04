# NgxRecaptcha

Simple library project to make RE-CAPTCHA usable on Angluar.

Supporting also **visible** and **inivisble** reCAPTCHA

### Import module

```typescript

import { NgxRecaptchaModule } from 'ngx-recaptcha-easy'

...
@NgModule({
  imports: [
            ...
            NgxRecaptchaModule
            ]
  })
...
```

### View

Use in template like below

```html
 <ngx-recaptcha site_key="<GOOGLE_RECAPTCHA_SITE_KEY>"></ngx-recaptcha>
```

#### Options

Required attributes
 * **site_key**  the Google reCaptcha public key. 
 
 Optional attributes (see also API at https://developers.google.com/recaptcha/intro)
 - **language**
 - **theme** 
 - **type**
 - **size**
 - **tabindex**
 - **global** If true, the reCaptcha script will be loaded from www.recaptcha.net instead of www.google.com   
 - **script_url**  the Google reCaptcha javascript or any other javascript that renders a CAPTCHA. 
                   Default is `https://(www.recaptcha.net|www.google.com)/recaptcha/api.js?hl=(language)&render=explicit& onload=reCaptchaOnloadCallback`.
                   If another javascript is provided that Google's ReCAPTCHA then make sure it is fully compliant.
 

## EventHandler

- **(loaded)**   
    This callback invokes `grecaptcher.init()` to initialize the re-captcha.   
    This also should call `grecaptcher.execute()` when using `size=invisible`.   
- **(error)**   
    This callback will receive any error loading the re-captcha script.   
- **(captchaResponse)**  
    Will provide the CAPTCHA token  
- **(captchaExpired)**  
    Will notify when the CAPTCHA token has expired.  


## Methods

### Renew
Renew / reset the CAPTCHA token
```typescript
this.captcha.reset();
```

### Read
Re-read an existing CAPTCHA token
```typescript
let token = this.captcha.getResponse();
```


## DEMO

Run the DEMO

Clone this project `git clone ...`

Install dependencies with `npm install`

Start DMEO `npm start`