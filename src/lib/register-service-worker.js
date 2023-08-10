/* @flow */
// In production, we register a service worker to serve assets from local cache.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on the "N+1" visit to a page, since previously
// cached resources are updated in the background.

// To learn more about the benefits of this model, read https://goo.gl/KwvDNy.
// This link also includes instructions on opting out of this behavior.

import { stringifyError } from '@krakenjs/belter/src';

import { SERVICE_WORKER, CLASS } from '../constants';

import { getLogger } from './logger';

const {
    SERVICE_WORKER_URL,
    SW_SCOPE,
    GET_SW_LOGS_EVENT_NAME,
    LOGS_CHANNEL_NAME,
    GET_SW_LOGS_RESPONSE_EVENT_NAME
} = SERVICE_WORKER;
const LOG_PREFIX = 'SERVICE_WORKER_';

let broadcastChannel = {};

type RegisterServiceWorkerParams = {|
    dumbledoreCurrentReleaseHash? : string,
    dumbledoreServiceWorker? : string,
|};

const requestSwLogs = () => {
    broadcastChannel.postMessage({
        type: GET_SW_LOGS_EVENT_NAME
    });
};

const startBroadCastChannel = () => {
    broadcastChannel = new BroadcastChannel(LOGS_CHANNEL_NAME);
};

const listenBroadCastChannelEvents = () => {
    // Listen SW flush logs event
    broadcastChannel.addEventListener('message', (event : Event) => {
        // $FlowFixMe
        const { payload = [], eventName } = event.data;
        if (payload && eventName === GET_SW_LOGS_RESPONSE_EVENT_NAME) {
            getLogger().info(`${ LOG_PREFIX }LOGS`, {
                logs: JSON.stringify(payload)
            });
        }
    });
};

const registerButtonHandlers = () => {
    const paypalButtons = document.getElementsByClassName(CLASS.BUTTON);
    for (let i = 0; i < paypalButtons.length; i++) {
        paypalButtons[i].addEventListener('click', requestSwLogs);
    }
}

const unRegisterButtonHandlers = () => {
    const paypalButtons = document.getElementsByClassName(CLASS.BUTTON);
    for (let i = 0; i < paypalButtons.length; i++) {
        paypalButtons[i].removeEventListener('click', requestSwLogs);
    }
}

const startRegistration = (swUrl) => {
    // eslint-disable-next-line compat/compat
    navigator.serviceWorker
        ?.register(swUrl, { scope: SW_SCOPE })
        .then((registration) => {

            getLogger().info(`${ LOG_PREFIX }REGISTERED`);

            registration.addEventListener('updatefound', () => {
                const installingWorker = registration.installing;

                if (installingWorker) {
                    installingWorker.addEventListener('statechange', () => {
                        const state = installingWorker.state;
                        if (state === 'activated') {
                            requestSwLogs();
                        }
                        getLogger().info(`${ LOG_PREFIX }REGISTERING: ${ installingWorker.state }`);
                    });
                }

            });
        })
        .catch((err) => {
            getLogger().error(`${ LOG_PREFIX }ERROR_REGISTERING`, { err: stringifyError(err) });
            unRegisterButtonHandlers();
        });
}

export function getSanitizedUrl (releaseHash: string, serviceWorker: string): string {
    const clearedHash = releaseHash.replace(/[^0-9a-z]/gi, '');
    // eslint-disable-next-line compat/compat
    const sanitizedUrl = new URL(`${SERVICE_WORKER_URL}/${serviceWorker}?releaseHash=${clearedHash}`);
    return sanitizedUrl.toString();
}

const executeServiceWorker = (releaseHash: string, serviceWorker: string) => {
    const swUrl = getSanitizedUrl(releaseHash, serviceWorker);
        
    getLogger().info(`${ LOG_PREFIX }REGISTER_START`, {
        url: swUrl
    });
    if(swUrl){
        startRegistration(swUrl);
    }
    else {
        getLogger().error(`${ LOG_PREFIX }ERROR_DURING_SWURL_GENERATION`);
    }
}

export function registerServiceWorker({ dumbledoreCurrentReleaseHash, dumbledoreServiceWorker }: RegisterServiceWorkerParams) {
    // Browser eligibility criteria for SW registration
    if ('serviceWorker' in navigator === false || 'BroadcastChannel' in window === false) {
        getLogger().info(`${ LOG_PREFIX }NOT_SUPPORTED`, {
          serviceWorker: Boolean('serviceWorker' in navigator),
          BroadcastChannel: Boolean('BroadcastChannel' in window),
        });
        return;
    }
    if (!dumbledoreCurrentReleaseHash) {
        getLogger().error(`${ LOG_PREFIX }RELEASE_HASH_NOT_PROVIDED`, { releaseHash: dumbledoreCurrentReleaseHash });
        return;
    }
    if (!dumbledoreServiceWorker) {
        getLogger().error(`${ LOG_PREFIX }SERVICE_WORKER_URL_NOT_PROVIDED`, { serviceWorker: dumbledoreServiceWorker });
        return;
    }
    try {
        registerButtonHandlers();
        startBroadCastChannel();
        listenBroadCastChannelEvents();
        executeServiceWorker(dumbledoreCurrentReleaseHash, dumbledoreServiceWorker);
    } catch (err) {
        getLogger().error(`${ LOG_PREFIX }ERROR_DURING_INITIALIZATION`, { err: stringifyError(err) });
    }
}

export function unregisterServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker?.ready.then((registration) => {
            getLogger().info(`${ LOG_PREFIX }UNREGISTER`);
            registration.unregister();
            unRegisterButtonHandlers();
        });
    }
}
