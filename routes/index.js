'use strict';
const router = require('express').Router();
const Menu = require('../constants');
const { VoiceHelper } = require('../utils/IVR_helpers');


let AT_apiKey = process.env.AT_APP_APIKEY,
    AT_username = process.env.AT_APP_USERNAME,
    AT_virtualNumber = process.env.AT_VIRTUAL_NUMBER,
    APP_URL = process.env.APP_URL;

const ATVoice = new VoiceHelper({
    AT_apiKey,
    AT_username,
    AT_virtualNumber,
});

const CustomerSession = new Map();
const CallAgents = new Map();
const SurveyQuestions = new Map();

router.get('/', async (req, res) => {
    res.render('keypad.html.ejs');
});

router.post('/capability-token', async (req, res) => {
    console.log({
        route: '/capability-token',
        body: req.body,
    });
    let clientname = req.body.clientname || 'doctor';
    let callRepresentativeName = ATVoice.generateATClientName({
        isForInitialization: true,
        firstName: clientname,
    });
    const ct = await ATVoice.generateCapabilityToken({
        callRepresentativeName,
    });
    ct.status === 'successful'
        ? res.json({ ...ct.data })
        : res.json({ failed: true });
});

router.post('/callback_url', async (req, res) => {
    // return res.end();
    try {
        let clientDialedNumber = req.body.clientDialedNumber;
        let callActions, responseAction, redirectUrl, lastRegisteredClient;
        let callerNumber = req.body.callerNumber;
        let destinationNumber = req.body.destinationNumber;
        let sessionID = req.body.sessionId;

        if (clientDialedNumber) {
            // assumes a browser tried to make a call to either virtualNumber(Dequeue) or a customer number(outgoing call)

            if (clientDialedNumber === AT_virtualNumber) {
                // Browser wants to dequeue a call - ignore this logic for now
            } else {
                // Browser wants to make a call to a customer number
                callActions = ATVoice.converseViaBrowser({
                    role: 'VCC_TO_CUSTOMER',
                    customerNumber: clientDialedNumber,
                });
            }
        } else {
            // Here we assume the call is incoming from a customer to the hospital
            // Lead customer to survey form: DTMF
            let session = CustomerSession.get(sessionID);
            if (!session) {
                CustomerSession.set(sessionID, '');
            }
            callActions = ATVoice.survey({
                textPrompt: `Welcome to counties Talking. Press 1 for emergency. Press 2 for Land.
                Press 3 for Funds. Press 4 for Health. After selecting your option, press the hash key`,
                finishOnKey: '#',
                timeout: 7,
                callbackUrl: `${APP_URL}/survey/step1`,
            });
        }

        responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
        console.log({ responseAction });
        return res.send(responseAction);
    } catch (error) {
        console.error({ error });
        return res.sendStatus(500);
    }
});

router.post('/survey/:whichStep', (req, res) => {
    let callActions,
        responseAction,
        done = false,
        pressedKey = req.body.dtmfDigits,
        currentStep = req.params.whichStep;
    let sessionID = req.body.sessionId;
    let session = CustomerSession.get(sessionID);
    if (!session) {
        CustomerSession.set(sessionID, pressedKey);
    } else {
        CustomerSession.set(sessionID, session + '.' + pressedKey);
    }
    
    session = CustomerSession.get(sessionID);

    console.log("session value", session);
    let response = Menu[session];
    if (response) {
        if (response.end) {
            callActions = ATVoice.saySomething({
                speech: response.message + '. Goodbye',
            });
        } else {
            callActions = ATVoice.survey({
                textPrompt: response.message,
                finishOnKey: '#',
                timeout: 7,
                callbackUrl: `${APP_URL}/survey/1`,
            });
        }
    } else {
        callActions = ATVoice.saySomething({
            speech: 'Sorry, you did not press any of the keys. Goodbye.',
        });
    }

    responseAction = `<?xml version="1.0" encoding="UTF-8"?><Response>${callActions}</Response>`;
    return res.send(responseAction);
});

module.exports = router;
