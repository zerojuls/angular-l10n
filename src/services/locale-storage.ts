import { Injectable, Inject } from '@angular/core';

import { LOCALE_CONFIG, LocaleConfig } from '../models/l10n-config';
import { StorageStrategy } from '../models/types';

/**
 * Implement this class-interface to create a custom storage for default locale & currency.
 */
@Injectable() export abstract class LocaleStorage {

    /**
     * This method must contain the logic to read the storage.
     * @param name 'defaultLocale' or 'currency'
     * @return A promise with the value of the given name
     */
    public abstract async read(name: string): Promise<string | null>;

    /**
     * This method must contain the logic to write the storage.
     * @param name 'defaultLocale' or 'currency'
     * @param value The value for the given name
     */
    public abstract async write(name: string, value: string): Promise<void>;

}

@Injectable() export class BrowserStorage implements LocaleStorage {

    private hasCookie: boolean;
    private hasStorage: boolean;

    constructor( @Inject(LOCALE_CONFIG) private configuration: LocaleConfig) {
        this.hasCookie = typeof navigator !== "undefined" && navigator.cookieEnabled;
        this.hasStorage = typeof Storage !== "undefined";
    }

    public async read(name: string): Promise<string | null> {
        let value: string | null = null;
        if (this.configuration.storage != StorageStrategy.Disabled) {
            if (this.configuration.storage == StorageStrategy.Local && this.hasStorage) {
                value = this.getLocalStorage(name);
            } else if (this.configuration.storage == StorageStrategy.Session && this.hasStorage) {
                value = this.getSessionStorage(name);
            } else if (this.configuration.storage == StorageStrategy.Cookie && this.hasCookie) {
                value = this.getCookie(name);
            }
        }
        return value;
    }

    public async write(name: string, value: string): Promise<void> {
        if (this.configuration.storage != StorageStrategy.Disabled) {
            if (this.configuration.storage == StorageStrategy.Local && this.hasStorage) {
                this.setLocalStorage(name, value);
            } else if (this.configuration.storage == StorageStrategy.Session && this.hasStorage) {
                this.setSessionStorage(name, value);
            } else if (this.configuration.storage == StorageStrategy.Cookie && this.hasCookie) {
                this.setCookie(name, value);
            }
        }
    }

    private getLocalStorage(name: string): string | null {
        return localStorage.getItem(name);
    }

    private getSessionStorage(name: string): string | null {
        return sessionStorage.getItem(name);
    }

    private getCookie(name: string): string | null {
        let result: RegExpExecArray | null = null;
        if (typeof document !== "undefined") {
            result = new RegExp("(?:^|; )" + encodeURIComponent(name) + "=([^;]*)").exec(document.cookie);
        }
        return result ? result[1] : null;
    }

    private setLocalStorage(name: string, value: string): void {
        localStorage.setItem(name, value);
    }

    private setSessionStorage(name: string, value: string): void {
        sessionStorage.setItem(name, value);
    }

    private setCookie(name: string, value: string): void {
        let expires: string = "";
        if (this.configuration.cookieExpiration != null) {
            const expirationDate: Date = new Date();
            expirationDate.setTime(
                expirationDate.getTime() +
                (this.configuration.cookieExpiration * 24 * 60 * 60 * 1000)
            );
            expires = "; expires=" + expirationDate.toUTCString();
        }
        if (typeof document !== "undefined") {
            document.cookie = name + "=" + value + expires + "; path=/";
        }
    }

}
