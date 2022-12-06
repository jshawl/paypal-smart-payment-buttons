/* @flow */
/* eslint import/no-namespace: off */

import {WALLET_INSTRUMENT} from '@paypal/sdk-constants';
import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';


import * as graphqlAPI from './api'
import { enableVault, oneClickApproveOrder } from './order';

describe('order api', () => {
    it('Call enableVault directly', async () => {
        const callgraphqlCall = jest.spyOn(graphqlAPI, 'callGraphQL').mockImplementationOnce(jest.fn())
        await enableVault({orderID:'', 
            buttonSessionID:"xxxxxxx",
            clientAccessToken:"xxxxxxx",
            fundingSource:"PAYPAL",
            integrationArtifact:"xxxxx",
            productFlow:"xxxxxxx",
            userExperienceFlow:"xxxxx"
        })
        expect(callgraphqlCall).toBeCalled()
    });
    it('invokes oneClickApproveOrder with variables', () => {
        const callgraphqlCall = jest.spyOn(graphqlAPI, 'callGraphQL').mockImplementation(() => ZalgoPromise.resolve({
            oneClickPayment: {
                userId: 'abc'
            }
        }))
        oneClickApproveOrder({
            orderID: 'abc',
            instrumentID: '',
            instrumentType: WALLET_INSTRUMENT.CREDIT,
            buyerAccessToken: '',
            clientMetadataID: '',
            planID: 'abc123',
            useExistingPlanning: true,
        })
        expect(callgraphqlCall).toBeCalledWith(expect.objectContaining({
            variables: expect.objectContaining({
                planID: 'abc123',
                useExistingPlanning: true
            })
        }))
        oneClickApproveOrder({
            orderID: 'abc',
            instrumentID: '',
            instrumentType: WALLET_INSTRUMENT.CREDIT,
            buyerAccessToken: '',
            clientMetadataID: '',
            planID: 'xyz091',
            useExistingPlanning: false,
        })
        expect(callgraphqlCall).toBeCalledWith(expect.objectContaining({
            variables: expect.objectContaining({
                planID: 'xyz091',
                useExistingPlanning: false
            })
        }))
    });
});
