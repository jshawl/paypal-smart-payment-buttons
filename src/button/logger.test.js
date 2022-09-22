/* @flow */

import { COUNTRY } from '@paypal/sdk-constants/src';
import { getPageRenderTime, isIEIntranet, isObject, uniqueID } from '@krakenjs/belter/src';
import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';

jest.mock('@krakenjs/belter/src', () => ({
    ...jest.requireActual('@krakenjs/belter/src'),
    isIEIntranet: jest.fn(),
    getPageRenderTime: jest.fn()
}))
jest.mock('../lib', () => ({
    ...jest.requireActual('../lib'),
    isIOSSafari: jest.fn(),
    isAndroidChrome: jest.fn(),
    isStorageStateFresh: jest.fn(),
    prepareLatencyInstrumentationPayload: jest.fn()
}))

import { getLogger, isIOSSafari, isAndroidChrome, isStorageStateFresh, prepareLatencyInstrumentationPayload } from '../lib';

import { setupButtonLogger } from './logger';

import {DATA_ATTRIBUTES} from '../constants';

describe('getButtonProps', () => {


    const buttonLoggerProps = {
        env:                       'test',
        sessionID:                 uniqueID(),
        clientID:                  uniqueID(),
        commit:                    true,
        sdkCorrelationID:          uniqueID(),
        buttonCorrelationID:       uniqueID(),
        partnerAttributionID:      uniqueID(),
        fundingSource:             'applepay',
        buttonSessionID:           uniqueID(),
        merchantDomain:            'mock://www.paypal.com',
        sdkVersion:                '1.2.3',
        stickinessID:              uniqueID(),
        buyerCountry:              COUNTRY.US,
        onShippingChange:          jest.fn(),
        getQueriedEligibleFunding: () => ZalgoPromise.resolve([]),
        style:                     { tagline: true, shape: '', layout: '', label: '', color: '' },
        locale:                    {
            country: 'US',
            lang:    'en'
        },
        merchantID:                [ 'XYZ12345' ]
    };
    global.__SMART_BUTTONS__ = {};
    const infoMock = jest.fn();
    const trackMock = jest.fn();
    const logger = getLogger();

    it('should send logs for CPL', async () => {
        jest.spyOn(logger, 'info').mockImplementation(infoMock)
        jest.spyOn(logger, 'track').mockImplementation(trackMock)
        jest.spyOn(Date, 'now').mockImplementation(() => 4000);
        jest
            .spyOn(window, 'performance', 'get')
            .mockImplementation(() => ({
                now:    jest.fn(() => 1000),
                timing: {
                    navigationStart: 1000
                },
                getEntriesByName: jest.fn(() => (
                    [
                        { startTime: 2000 }
                    ]
                ))
            }));
        await setupButtonLogger(buttonLoggerProps);
        expect(infoMock).toHaveBeenCalledTimes(12);
        expect(infoMock).toHaveBeenCalledWith('CPL_LATENCY_METRICS_SECOND_RENDER');
        expect(trackMock).toHaveBeenCalledTimes(2);
        expect(trackMock).toHaveBeenCalledWith(expect.objectContaining({
            state_name:        'CPL_LATENCY_METRICS',
            transition_name:   'process_client_metrics',
            page_name:         'main:xo:paypal-components:smart-payment-buttons'
        }));
    });

    it('should fail to get performance marks', async () => {
        jest.spyOn(logger, 'info').mockImplementation(infoMock)
        jest.spyOn(logger, 'track').mockImplementation(trackMock)
        jest
            .spyOn(window, 'performance', 'get')
            .mockImplementation(() => ({}));
        await setupButtonLogger(buttonLoggerProps);
        expect(infoMock).toHaveBeenCalledWith('button_render_CPL_instrumentation_log_error');
    });

    it('should not execute cpl instrumentation', async () => {
        jest.spyOn(logger, 'info').mockImplementation(infoMock)
        jest.spyOn(logger, 'track').mockImplementation(trackMock)
        jest
            .spyOn(window, 'performance', 'get')
            .mockImplementation(() => null);
        await setupButtonLogger(buttonLoggerProps);
        expect(infoMock).toHaveBeenCalledWith('button_render_CPL_instrumentation_not_executed');
    });

    it('invokes the correct builders when not mocked', async () => {
        // This test exists to show that the builders inside of `setupButtonLogger`
        // are invoked correctly. note that this test does not have
        // jest.spyOn for 'track' (or 'info').
        let builderMock = jest.fn()
        jest.spyOn(logger, 'addTrackingBuilder').mockImplementation(builderMock)
        await setupButtonLogger(buttonLoggerProps);
        expect(builderMock).toHaveBeenCalled()
    });

    it('warns on IE intranet', async () => {
        const warnMock = jest.fn()
        jest.spyOn(logger, 'warn').mockImplementation(warnMock)
        isIEIntranet.mockImplementation(() => true)
        await setupButtonLogger(buttonLoggerProps);
        expect(warnMock).toHaveBeenCalled()
    })

    it('covers all possible logging environment conditions', async () => {
        jest.spyOn(logger, 'info').mockImplementation(infoMock)
        isIOSSafari.mockImplementation(() => true)
        isStorageStateFresh.mockImplementation(() => true)
        await setupButtonLogger(buttonLoggerProps);
        expect(infoMock).toHaveBeenCalledWith('button_render_ios_safari_storage_state_fresh')

        isIOSSafari.mockImplementation(() => false)
        isAndroidChrome.mockImplementation(() => true)
        isStorageStateFresh.mockImplementation(() => false)
        prepareLatencyInstrumentationPayload.mockImplementation(() => ({comp: true}))
        getPageRenderTime.mockImplementation(() => 123)
        buttonLoggerProps.style.tagline = undefined
        await setupButtonLogger(buttonLoggerProps);
        expect(infoMock).toHaveBeenCalledWith('button_render_android_chrome_storage_state_not_fresh')

        buttonLoggerProps.style.tagline = false
        await setupButtonLogger(buttonLoggerProps);

        buttonLoggerProps.onShippingChange = false
        await setupButtonLogger(buttonLoggerProps);

        document.body.innerHTML = `<span ${DATA_ATTRIBUTES.FUNDING_SOURCE}="paypal"></span><span ${DATA_ATTRIBUTES.INSTRUMENT_TYPE}="paypal"></span>`
        await setupButtonLogger({...buttonLoggerProps, commit: false, experience: 'inline'});
    })

    afterEach(() => {
        jest.clearAllMocks();
    });
});
