import { ProxyConfigurationOptions } from 'apify';

export interface Schema {
    addresses?: string;
    cookiesToScrape?: number;
    proxy?: ProxyConfigurationOptions;
}

export interface ResultsObject {
    address: string;
    zpid: number;
    zestimate: number;
}
