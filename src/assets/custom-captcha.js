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
