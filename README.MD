# NgxRecaptcha

Simple library project to make RE-CAPTCHA usable on Angluar.

Supporting also **visible**, **inivisble** reCAPTCHA and custom CAPTCHA.


Version 0.0.x is compliant with Angular >=8

Version 9.0.x is compliant with Angular >=9


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


## Example for a custom CAPTCHA script

You may define your own custom implementation of a CAPTCHA javascript.  
The url to the script should then be provided in attribute `script_url`.  
e.g. `script_url=assets/custom-captcha.js`  
The javascript must be fully compliant to the Google ReCAPTCHA so,  
the component can easily switch between them.

Here is a full example

```typescript
var captcha = (function (window) {

    const render = (element, options) => {
        console.log('element:', element)
        const el = document.createElement('input')
        el.value = ''
        el.addEventListener('input', (event) => {
            options.callback(el.value)
        })
        el.placeholder = 'Set value 1234'
        element.appendChild(el)
        element.widgetIds = element.widgetIds || []
        const widgetId = 'custom-captcha-' + (+new Date())
        element.widgetIds.push(widgetId)
        el.id = widgetId
        return widgetId
    }
    const execute = (elementId) => {
        console.log('execute', elementId)
    }
    const getResponse = (elementId) => {
        console.log('getResponse', elementId)
        return document.querySelector(`#${elementId}`).value
    }
    const reset = (elementId) => {
        console.log('reset', elementId)
        document.querySelector(`#${elementId}`).value = ''
    }
    const ready = () => {

    }
    const getScriptURL = () => {
        var script = document.currentScript || document.querySelector('script[src*="custom-captcha.js"]')
        return script.src
    }
    const a = {
        render: render,
        execute: execute,
        getResponse: getResponse,
        reset: reset,
        ready: ready
    }
    console.log('getScriptURL', getScriptURL())
    window.grecaptcha = window.captcha = a

    const currentUrl = getScriptURL()
    if (-1 == currentUrl.indexOf('onload=')) {
        throw `Missing onload callback`
    }
    const onLoadCallback = currentUrl.split('onload=')[1].split('&')[0]
    if (onLoadCallback) {
        try { window[onLoadCallback]() } catch (e) { console.error(e) }
    }
    return a
})(window)

```

