import Apify, { RequestOptions } from 'apify';
import * as consts from './consts';
import { farmCookies, getCookie, removeCookie } from './cookies';
import { Schema, ResultsObject } from './types';

const { log } = Apify.utils;

Apify.main(async () => {
    const { addresses, cookiesToScrape = 5, proxy, maxConcurrency = 100 } = (await Apify.getInput()) as Schema;

    if (!addresses) throw new Error('Must provide at least one address!');
    await farmCookies(cookiesToScrape);

    const requests: RequestOptions[] = [];

    // Add autocomplete request for every address
    for (const address of addresses) {
        requests.push(consts.FIND_ADDRESS_REQUEST(address));
    }

    const requestList = await Apify.openRequestList('start-urls', requests);
    const requestQueue = await Apify.openRequestQueue();
    const proxyConfiguration = await Apify.createProxyConfiguration({
        ...proxy,
    });

    const crawler = new Apify.CheerioCrawler({
        handlePageTimeoutSecs: 30,
        proxyConfiguration,
        requestQueue,
        requestList,
        useSessionPool: true,
        persistCookiesPerSession: false,
        maxRequestRetries: 5,
        maxConcurrency,
        preNavigationHooks: [
            async ({ request }) => {
                // If request has been retried and there is a cookie, swap the cookie for a new one
                if (request.retryCount) {
                    const { cookie } = request.headers;
                    if (!cookie) return;
                    removeCookie(cookie);
                    request.headers.cookie = getCookie() as string;
                }
            },
        ],
        handlePageFunction: async ({ request, json, crawler: { requestQueue: crawlerRequestQueue } }) => {
            switch (request.userData.label) {
                default:
                    break;
                case consts.LABELS.FIND_ADDRESS: {
                    // Grab property ID
                    const { address } = request.userData;

                    log.info(`Grabbing PropertyID from ${address}...`);

                    const zpid = json.results[0]?.metaData?.zpid;

                    if (!zpid) {
                        log.warning(`${address} not found`);

                        await Apify.pushData({
                            zpid: null,
                            address,
                            zestimate: null,
                        });
                        break;
                    }

                    const cookie = getCookie() as string;

                    // Plug property ID into GraphQL endpoint
                    await crawlerRequestQueue?.addRequest(consts.ESTIMATE_REQUEST({ zpid, address, cookie }));
                    break;
                }
                case consts.LABELS.GET_ESTIMATE: {
                    const { address, zpid } = request.userData as Partial<ResultsObject>;
                    const { data } = json;

                    if (!data?.property) throw new Error(`Failed with ${address}. Trying again`);

                    let { zestimate } = data.property;
                    if (!zestimate) zestimate = 'N/A';

                    log.info(`Pushing Zestimate for ${address} to dataset`);

                    await Apify.pushData({ zpid, address, zestimate });
                    break;
                }
            }
        },
    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');
});
