﻿// ANGULAR 2 LOCALIZATION
// an injectable class for localization of angular 2 applications
// by direct or asynchronous loading of translations
// written by roberto simonetti
// MIT license
// https://github.com/robisim74/angular2localization

// dependencies:
// - angular: v2.0.0-alpha.37

/// <reference path="../typings/angular2/angular2.d.ts" />
/// <reference path="../typings/angular2/http.d.ts" />

import {Injectable} from 'angular2/angular2';
import {Http} from 'angular2/http';

/**
 * localization is an injectable class that use angular 2 http module
 * to start, add in route component:
 * 
 * @Component({
 *      selector: 'app',
 *      bindings: [Localization] 
 * })
 * ...
 * class app {
 *      constructor(public localization: Localization){
 *      ...
 *  }
 * }
 * bootstrap(app, [HTTP_BINDINGS]);
 */

/**
 * DIRECT LOADING
 * to inizialize localization by direct loading add the following code in the body of constructor of route component:
 * 
 * var translationEN = {
 *      EXAMPLE: 'example',
 *      ...
 * }
 * // add a new translation here
 * 
 * this.localization.addTranslation('en', translationEN); // required (parameters: language, translation)
 * this.localization.addTranslation('it', translationIT);
 * // add a new language here 
 * this.localization.definePreferredLanguage('en', 30); // required: define preferred language (parameter: default language, expires (No days) - if omitted, the cookie becomes a session cookie)
 */
 
/**
 * ASYNCHRONOUS LOADING
 * to inizialize localization by asynchronous loading add the following code in the body of constructor of route component:
 * 
 * this.localization.addTranslation('en'); // required: add a new translations (parameter: a new language) 
 * this.localization.addTranslation('it');
 * // add a new language here
 * this.localization.definePreferredLanguage('en', 30); // required: define preferred language (parameter: default language, expires (No days) - if omitted, the cookie becomes a session cookie)
 * this.localization.translationProvider('./resources/locale-'); // required: initialize translation provider (parameter: path prefix)
 * 
 * and create the json files of translations such as "locale-en.json"
 * (url is obtained concatenating {prefix} + {locale language code} + ".json")
 */

@Injectable() export class Localization {

    prefix: string;

    locale: string; // language code
    
    languagesData: Array<string> = []; // array of available languages codes
    
    translationsData: any = {}; // object of translations
    
    expires: number; // define when the cookie will be removed

    constructor(public http: Http) { }
            
    // direct & asynchronous loading: add a new translation
    addTranslation(locale: string, translation?: any) {

        this.languagesData.push(locale);

        if (translation != null) {
            // direct loading
            this.translationsData[locale] = translation;
        }

    }
    
    // define preferred language
    definePreferredLanguage(defaultLanguage: string, expires?: number) {

        this.expires = expires;
        
        // try to get cookie
        this.locale = this.getCookie("locale"); // call get cookie method

        if (this.locale == null) {
            // get current browser language or default language
            var browserLanguage: string = navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage;

            browserLanguage = browserLanguage.substring(0, 2); // get two-letter code    
        
            if (this.languagesData.indexOf(browserLanguage) != -1) {
                this.locale = browserLanguage;
            }
            else {
                this.locale = defaultLanguage;
            }

            this.setCookie("locale", this.locale, this.expires); // call set cookie method
        }

    }
    
    // asinchronous loading: define translation provider & get json data
    translationProvider(prefix: string) {

        this.prefix = prefix;
        var url: string = this.prefix + this.locale + '.json';
        
        // angular 2 http module
        this.http.get(url)
            .toRx()
            .map(res => res.json())
            .subscribe(res => this.translationsData = res);

    }
        
    // get current language
    getCurrentLanguage() {

        return this.locale;

    }
    
    /**
     * CHANGE LANGUAGE
     * to change language at runtime, add in the component:
     *  
     * selectLanguage(locale) {
     *      this.localization.setCurrentLanguage(locale);
     * }
     * 
     * where locale parameter is the language code; then add in the view:
     * 
     * <a (click)="selectLanguage('en')">English<</a>
     * ...
     */
        
    // set current language
    setCurrentLanguage(locale: string) {

        if (this.locale != locale) { // check if language is changed
            this.setCookie("locale", locale, this.expires); // call set cookie method      
            this.locale = locale; // set language code
            
            if (this.prefix != null) {
                this.translationProvider(this.prefix); // update translations data               
            }
        }

    }

    /**
    * DIRECT LOADING
    * to get translation by direct loading add the following code in each component:
    * 
    * translate(key) {
    *       return this.localization.translate(key);
    * }
    * 
    * and in the view:
    * 
    * <p>{{ translate('EXAMPLE') }}</p>
    */

    // get translation by direct loading
    translate(key: string) {

        var translation: any = this.translationsData[this.locale]; // get translations by locale       
        var value: string = translation[key]; // get translated value by key
        return value;

    }
    
    /**
     * ASYNCHRONOUS LOADING
     * to get translation by asynchronous loading add the following code in each component:
     * 
     * translate(key) {
     *      return this.localization.asyncTranslate(key);
     * }
     * 
     * and in the view:
     * 
     * <p>{{ translate('EXAMPLE') }}</p>
     */
    
    // get translation by asynchronously loading
    asyncTranslate(key: string) {

        var value: string = this.translationsData[key]; // get translated value by key
        return value;

    }
    
    // cookies methods
    // set cookie
    setCookie(name: string, value: string, days?: number) {

        if (days != null) {
            var expirationDate: Date = new Date();
            expirationDate.setTime(expirationDate.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires: string = "; expires=" + expirationDate.toUTCString();
        }
        else {
            var expires: string = "";
        }

        document.cookie = name + "=" + value + expires + "; path=/";

    }
    // get cookie
    getCookie(name: string) {

        name += "=";

        var ca: string[] = document.cookie.split(';');

        for (var i = 0; i < ca.length; i++) {
            var c: string = ca[i];
            while (c.charAt(0) == ' '){
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0){
                return c.substring(name.length, c.length);
            }
        }
        
        return null;

    }

}
// end localization class
