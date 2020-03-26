import { describe, test, it, expect } from 'jest-without-globals';
//declare var describe: any, test: any, expect: any;

import {getMockNetwork, MockCommunication} from "./mock-network";
import {VcLeaderProtocol} from "../src/leader-protocol";

describe('Protocol', () => {
    test('Events get executed on client and leader when client sends', () => {
        const {leader, clients} = getMockNetwork(1);
        const client = clients[0];

        const event = {type: 'mousedown', target: 'svg', targetType: 'svg', timeStamp: 0, collaboratorId: '', touches: []};
        client.localEvent(event);

        expect(client.ledgers.get('svg')!.length).toBe(1);
        expect(leader.ledgers.get('svg')!.length).toBe(1);
    });

    test('Events get executed on client and leader when leader sends', () => {
        const {leader, clients} = getMockNetwork(1);
        const client = clients[0];

        const event = {type: 'mousedown', target: 'svg', targetType: 'svg', timeStamp: 0, collaboratorId: '', touches: []};
        leader.localEvent(event);

        expect(client.ledgers.get('svg')!.length).toBe(1);
        expect(leader.ledgers.get('svg')!.length).toBe(1);
    });

    test('Multiple events get executed', () => {
        const {leader, clients} = getMockNetwork(1);
        const client = clients[0];

        const eventA = {type: 'mousedown', target: 'svg', targetType: 'svg', timeStamp: 0, collaboratorId: '', touches: []};
        const eventB = {...eventA};
        client.localEvent(eventA);
        client.localEvent(eventB);

        expect(client.ledgers.get('svg')!.length).toBe(2);
        expect(leader.ledgers.get('svg')!.length).toBe(2);
    });

    test('Multiple element executors get blocked', () => {
        const {leader, clients} = getMockNetwork(1);
        const client = clients[0];

        const eventA = {type: 'mousedown', target: 'svg', targetType: 'svg', timeStamp: 0, collaboratorId: '', touches: []};
        leader.localEvent(eventA);

        expect(client.ledgers.get('svg')!.length).toBe(1);
        expect(leader.ledgers.get('svg')!.length).toBe(1);

        const eventB = {...eventA};
        client.localEvent(eventB);

        expect(client.ledgers.get('svg')!.length).toBe(1);
        expect(leader.ledgers.get('svg')!.length).toBe(1);
    });

    test('Delays work as expected', async () => {
        const {leader, clients} = getMockNetwork(1);
        const client = clients[0];

        (leader.communication as MockCommunication).delay = false;
        (client.communication as MockCommunication).delay = 20;

        const eventA = {type: 'mousedown', target: 'svg', targetType: 'svg', timeStamp: 0, collaboratorId: '', touches: []};
        const eventB = {...eventA};
        client.localEvent(eventA);

        expect(client.ledgers.get('svg')).toBeFalsy();
        expect(leader.ledgers.get('svg')).toBeFalsy();

        await wait(60);
        expect(client.ledgers.get('svg')!.length).toBe(1);
        expect(leader.ledgers.get('svg')!.length).toBe(1);

        client.localEvent(eventB);
        expect(client.ledgers.get('svg')!.length).toBe(2);
        expect(leader.ledgers.get('svg')!.length).toBe(1);

        await wait(30);
        expect(client.ledgers.get('svg')!.length).toBe(2);
        expect(leader.ledgers.get('svg')!.length).toBe(2);
    });

    test('Multiple element executors work in succession', async () => {
        const {leader, clients} = getMockNetwork(1);
        (leader as VcLeaderProtocol).lockService.expireTimeoutMs = 50;
        const client = clients[0];

        const eventA = {type: 'mousedown', target: 'svg', targetType: 'svg', timeStamp: 0, collaboratorId: '', touches: []};
        leader.localEvent(eventA);

        expect(client.ledgers.get('svg')!.length).toBe(1);
        expect(leader.ledgers.get('svg')!.length).toBe(1);

        await wait(60);
        const eventB = {...eventA};
        client.localEvent(eventB);

        expect(client.ledgers.get('svg')!.length).toBe(2);
        expect(leader.ledgers.get('svg')!.length).toBe(2);
    });
});

const wait = (ms: number) => new Promise<void>((resolve: () => void) => setTimeout(resolve, ms));
