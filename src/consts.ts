import { RequestOptions } from 'apify';

export enum LABELS {
    FIND_ADDRESS = 'FIND_ADDRESS',
    GET_ESTIMATE = 'GET_ESTIMATE',
}

export const BASE_URL = 'https://www.zillow.com';

export const ESTIMATE_QUERY =
    'query HowMuchIsMyHomeWorthReviewQuery($zpid: ID!) {\n  property(zpid: $zpid) {\n    streetAddress\n    city\n    state\n    zipcode\n    bedrooms\n    bathrooms\n    livingArea\n    zestimate\n    homeStatus\n  }\n  __typename\n}';

export const ADDRESS_QUERY_URL = (query: string): string => {
    return `https://www.zillowstatic.com/autocomplete/v3/suggestions?q=${query}&resultTypes=allAddress&resultCount=1`;
};

export const FIND_ADDRESS_REQUEST = (address: string): RequestOptions => {
    return {
        url: ADDRESS_QUERY_URL(address),
        userData: { label: LABELS.FIND_ADDRESS, address },
    };
};

export const ESTIMATE_REQUEST = ({ zpid, address, cookie }: { zpid: number; address: string; cookie: string }): RequestOptions => {
    return {
        url: `${BASE_URL}/graphql/`,
        headers: {
            'Content-Type': 'application/json',
            cookie,
        },
        method: 'POST',
        payload: JSON.stringify({
            operationName: 'HowMuchIsMyHomeWorthReviewQuery',
            variables: {
                zpid,
            },
            query: ESTIMATE_QUERY,
        }),
        useExtendedUniqueKey: true,
        userData: { address, zpid, label: LABELS.GET_ESTIMATE },
    };
};
