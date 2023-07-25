/* @flow */

import { isIEIntranet, getPageRenderTime } from '@krakenjs/belter/src';
import { type LoggerType } from '@krakenjs/beaver-logger/src';
import { FPTI_KEY, ENV, FUNDING, COUNTRY } from '@paypal/sdk-constants/src';
import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';

import type { LocaleType } from '../../types';
import { getLogger, setupLogger } from '../../lib';
import { FPTI_TRANSITION, FPTI_STATE, FPTI_CONTEXT_TYPE } from '../../constants';

type NativeLoggerOptions = {|
    env : $Values<typeof ENV>,
    sessionID : string,
    clientID : string,
    buttonSessionID : string,
    sdkCorrelationID : string,
    fundingSource : ?$Values<typeof FUNDING>,
    sdkVersion : string,
    locale : LocaleType,
    buyerCountry : $Values<typeof COUNTRY>
|};

export function setupNativeLogger({ env, sessionID, buttonSessionID, sdkCorrelationID, clientID, fundingSource, sdkVersion, locale, buyerCountry } : NativeLoggerOptions) : LoggerType {
    const logger = getLogger();

    setupLogger({ env, sessionID, clientID, sdkCorrelationID, locale, sdkVersion, buyerCountry });

    logger.addPayloadBuilder(() => {
        return {
            buttonSessionID,
        };
    });

    logger.addTrackingBuilder(() => {
        return {
            [FPTI_KEY.STATE]:                        FPTI_STATE.BUTTON,
            [FPTI_KEY.CONTEXT_TYPE]:                 FPTI_CONTEXT_TYPE.BUTTON_SESSION_ID,
            [FPTI_KEY.CONTEXT_ID]:                   buttonSessionID,
            [FPTI_KEY.BUTTON_SESSION_UID]:           buttonSessionID,
            [FPTI_KEY.BUTTON_VERSION]:               __SMART_BUTTONS__.__MINOR_VERSION__,
            [FPTI_KEY.CHOSEN_FUNDING]:               fundingSource,
        };
    });

    if (isIEIntranet()) {
        logger.warn('button_child_intranet_mode');
    }

    ZalgoPromise.hash({
        pageRenderTime: getPageRenderTime()
    }).then(({ pageRenderTime }) => {

        logger.track({
            [FPTI_KEY.TRANSITION]:     FPTI_TRANSITION.BUTTON_LOAD,
            [FPTI_KEY.SELECTED_FI]:    fundingSource,
            [FPTI_KEY.PAGE_LOAD_TIME]: pageRenderTime ? pageRenderTime.toString() : ''
        });

        logger.flush();
    });

    return logger;
}
