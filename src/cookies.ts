import Apify, { RequestOptions } from 'apify';

const { log, puppeteer } = Apify.utils;

const cookies: string[] = [];

const addCookie = (cookie: string): void => {
    cookies.push(cookie);
};

export const removeCookie = (cookie: string): void => {
    const i = cookies.indexOf(cookie);
    cookies.splice(i, 1);
};

export const getCookie = (): string | undefined => {
    if (!cookies.length) {
        log.warning('Ran out of farmed cookies! If the run fails, try increasing "cookiesToScrape"');
        return undefined;
    }
    return cookies[Math.floor(Math.random() * cookies.length)];
};

export const farmCookies = async (amount: number | undefined = 5): Promise<void> => {
    const requests: RequestOptions[] = [];

    for (let i = 0; i < amount; i++) {
        requests.push({ url: 'https://www.zillow.com/how-much-is-my-home-worth/', uniqueKey: `${i}` });
    }

    const requestList = await Apify.openRequestList('get-cookies', requests);
    const requestQueue = await Apify.openRequestQueue();
    const proxyConfiguration = await Apify.createProxyConfiguration({
        groups: ['SHADER'],
        countryCode: 'US',
    });

    const crawler = new Apify.PuppeteerCrawler({
        handlePageTimeoutSecs: 30,
        proxyConfiguration,
        requestQueue,
        requestList,
        useSessionPool: true,
        persistCookiesPerSession: true,
        autoscaledPoolOptions: {
            desiredConcurrency: amount,
        },
        launchContext: {
            useChrome: true,
            launchOptions: {
                // eslint-disable-next-line
                // @ts-ignore:next-line
                headless: true,
            },
        },
        preNavigationHooks: [
            async ({ page }) => {
                await puppeteer.blockRequests(page);
            },
        ],
        handlePageFunction: async ({ session, request, response }) => {
            session.setCookiesFromResponse(response);
            const cookie = session.getCookieString(request.url);
            addCookie(cookie);
        },
    });

    log.info(`Farming ${amount} cookie(s)...`);
    await crawler.run();
    log.info(`Farmed ${amount} cookie(s)`);
};

export const farmNewCookie = async (): Promise<string> => {
    log.info('Farming a new cookie to be used...');
    await farmCookies(1);
    return getCookie() as string;
};
