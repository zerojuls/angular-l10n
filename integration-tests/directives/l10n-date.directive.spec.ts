import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement } from '@angular/core';

import { L10nDateDirective } from './../../index';
import {
    L10nConfig,
    L10nLoader,
    LocalizationModule,
    LocaleService,
    StorageStrategy
} from './../../index';

describe('L10nDateDirective', () => {

    let comp: L10nDateComponent;
    let fixture: ComponentFixture<L10nDateComponent>;
    let des: DebugElement[];
    let els: HTMLElement[] = [];

    let l10nLoader: L10nLoader;
    let locale: LocaleService;

    const l10nConfig: L10nConfig = {
        locale: {
            defaultLocale: { languageCode: 'en', countryCode: 'US' },
            storage: StorageStrategy.Disabled
        }
    };

    beforeEach(() => {
        fixture = TestBed.configureTestingModule({
            declarations: [L10nDateComponent],
            imports: [
                HttpClientTestingModule,
                LocalizationModule.forRoot(l10nConfig)
            ]
        }).createComponent(L10nDateComponent);

        comp = fixture.componentInstance;
    });

    beforeEach((done) => {
        l10nLoader = TestBed.get(L10nLoader);
        locale = TestBed.get(LocaleService);
        
        l10nLoader.load().then(() => done());
    });

    beforeEach(() => {
        fixture.detectChanges();
        des = fixture.debugElement.queryAll(By.directive(L10nDateDirective));
        for (let i: number = 0; i < des.length; i++) {
            els.push(des[i].nativeElement);
        }
    });

    it('should render localized date', (() => {
        expect(els[0].textContent).toContain("Apr 19, 2017");
        expect(els[1].textContent).toContain("4/19/2017");
    }));

    it('should render localized attributes', (() => {
        expect(els[2].getAttribute('title')).toContain("4/19/2017");
    }));

    it('should render localized dates when default locale changes', fakeAsync(() => {
        locale.setDefaultLocale('it', 'IT');

        tick();
        fixture.detectChanges();
        els = [];
        for (let i: number = 0; i < des.length; i++) {
            els.push(des[i].nativeElement);
        }

        expect(els[0].textContent).toContain("19 apr 2017");
        expect(els[1].textContent).toContain("19/4/2017");
        expect(els[2].getAttribute('title')).toContain("19/4/2017");
    }));

});

@Component({
    template: `
        <p><em>should render localized date</em></p>
        <p l10nDate>{{ day }}</p>
        <p l10nDate="shortDate">{{ day }}</p>

        <p><em>should render localized attributes</em></p>
        <p l10n-title title="{{ day }}" l10nDate="shortDate"></p>
    `
})
class L10nDateComponent {

    day: Date = new Date('4/19/2017');

}
