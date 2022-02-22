export interface Schema {
    addresses?: string;
    cookiesToScrape?: number;
}

export interface ResultsObject {
    address: string;
    zpid: number;
    zestimate: number;
}
