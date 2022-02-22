import { ProxyConfigurationOptions } from 'apify';

export interface Schema {
    addresses?: string;
    cookiesToScrape?: number;
    maxConcurrency?: number;
    proxy?: ProxyConfigurationOptions & { useApifyProxy: boolean };
}

export interface ResultsObject {
    address: string;
    zpid: number;
    zestimate: number;
}
