import { describe, test, it, expect } from 'jest-without-globals';
//declare var describe: any, test: any, expect: any;

import {getMockNetwork} from "./mock-network";

describe('Protocol', () => {
    test('Events get executed on client and leader when client sends', () => {
        const {leader, clients} = getMockNetwork(1);
        const client = clients[0];

        const event = {type: 'mousedown', target: 'svg', targetType: 'svg', timeStamp: 0, collaboratorId: '', touches: []};
        client.localEvent(event);

        expect(client.ledgers.has('svg')).toBeTruthy();
        expect(client.ledgers.get('svg')!.length).toBe(1);

        expect(leader.ledgers.has('svg')).toBeTruthy();
        expect(leader.ledgers.get('svg')!.length).toBe(1);
    });

    test('Events get executed on client and leader when leader sends', () => {
        const {leader, clients} = getMockNetwork(1);
        const client = clients[0];

        const event = {type: 'mousedown', target: 'svg', targetType: 'svg', timeStamp: 0, collaboratorId: '', touches: []};
        leader.localEvent(event);

        expect(client.ledgers.has('svg')).toBeTruthy();
        expect(client.ledgers.get('svg')!.length).toBe(1);

        expect(leader.ledgers.has('svg')).toBeTruthy();
        expect(leader.ledgers.get('svg')!.length).toBe(1);
    });

    test('Multiple events get executed', () => {
        const {leader, clients} = getMockNetwork(1);
        const client = clients[0];

        const eventA = {type: 'mousedown', target: 'svg', targetType: 'svg', timeStamp: 0, collaboratorId: '', touches: []};
        const eventB = {type: 'mousedown', target: 'svg', targetType: 'svg', timeStamp: 0, collaboratorId: '', touches: []};
        client.localEvent(eventA);
        client.localEvent(eventB);

        expect(client.ledgers.has('svg')).toBeTruthy();
        expect(client.ledgers.get('svg')!.length).toBe(2);

        expect(leader.ledgers.has('svg')).toBeTruthy();
        expect(leader.ledgers.get('svg')!.length).toBe(2);
    });

    test('Multiple element executors get blocked', () => {
        const {leader, clients} = getMockNetwork(1);
        const client = clients[0];

        const eventA = {type: 'mousedown', target: 'svg', targetType: 'svg', timeStamp: 0, collaboratorId: '', touches: []};
        leader.localEvent(eventA);

        expect(client.ledgers.has('svg')).toBeTruthy();
        expect(client.ledgers.get('svg')!.length).toBe(1);

        expect(leader.ledgers.has('svg')).toBeTruthy();
        expect(leader.ledgers.get('svg')!.length).toBe(1);

        const eventB = {type: 'mousedown', target: 'svg', targetType: 'svg', timeStamp: 0, collaboratorId: '', touches: []};
        client.localEvent(eventB);

        expect(client.ledgers.has('svg')).toBeTruthy();
        expect(client.ledgers.get('svg')!.length).toBe(1);

        expect(leader.ledgers.has('svg')).toBeTruthy();
        expect(leader.ledgers.get('svg')!.length).toBe(1);
    });
});
