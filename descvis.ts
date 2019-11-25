interface DescEvent {
    seqNum: number,
    event: StrippedEvent,
    sender: string
}

class DescVis {
    private network: DescNetwork = new DescNetwork(this.receiveEvent.bind(this),
        this.onNewConnection.bind(this), this.onNewLeasee.bind(this));
    private eventsQueue: DescEvent[] = [];
    private sequenceNumber: number = 0;
    private eventsLedger: DescEvent[] = [];
    private leasees = new Map<HTMLElement, string>();
    private listener: DescListener;

    private leaseeTimeouts = new Map<HTMLElement, number>();

    constructor(private svg: SVGElement) {
        this.listener = new DescListener(this.svg, this.hearEvent.bind(this));
    }

    hearEvent(eventObj: StrippedEvent, event: Event) {
        if(!event.target) {
            return new Error('event has no target');
        }
        if(!this.network.id) {
            console.log('network not ready');
            (event as any)['stopImmediatePropagationBackup']();
            return;
        }
        const target = event.target as HTMLElement;
        const peerId = this.network.id;

        if(!this.leasees.has(target)) {
            //console.log('setting the leader of ', target, ' to ', peerId);
            this.leasees.set(target, peerId);
            this.network.setLeasee(eventObj.target, peerId);
        }
        //console.log('checking ', this.leasees.get(target), peerId, this.leasees.get(target) === peerId);

        if(this.leasees.get(target) !== peerId) {
            // Prevent event.
            console.log('Can not edit this element because I am not the leader.', target);
            (event as any)['stopImmediatePropagationBackup']();
            event.stopPropagation();
            return;
        }

        const prevTimeout = this.leaseeTimeouts.get(target);
        clearTimeout(prevTimeout);
        const newTimeout = setTimeout(() => this.unlease(target), 1000);
        this.leaseeTimeouts.set(target, newTimeout);

        const newEvent: DescEvent = {
            'seqNum': this.sequenceNumber,
            'event': eventObj,
            'sender': this.network.id
        };
        this.sequenceNumber++;
        this.eventsLedger.push(newEvent);
        //console.log(this.sequenceNumber);
        this.network.broadcastEvent(newEvent);
    }

    unlease(element: HTMLElement) {
        console.log('releasing ', element);
        this.leasees.delete(element);
        const selector = this.listener.getElementSelector(element);
        if(!selector) {
            return new Error('selector not found');
        }
        this.network.setLeasee(selector, '');
    }

    onNewLeasee(msg: NewLeaseeMessage) {
        // We are vulnerable to malicious actors here!

        // First, find the html element.
        const selector = msg.targetSelector;
        const target = document.querySelector(selector);
        if(!target) {
            return new Error(`could not find target element of leasee ${selector}`);
        }

        if(msg.leasee === '') {
            this.leasees.delete(target as HTMLElement);
        } else {
            this.leasees.set(target as HTMLElement, msg.leasee);
        }
    }

    onNewConnection(originalMsg: DescMessage): InitMessage {
        return {
            'type': 'new_connection',
            'sender': originalMsg.sender,
            'peers': originalMsg.peers as string[],
            'eventsLedger': this.eventsLedger,
        };
    }

    receiveEvent(remoteEvent: DescEvent) {
        let eventObject: StrippedEvent = remoteEvent.event;

        if (remoteEvent.seqNum >= this.sequenceNumber){
            this.sequenceNumber = remoteEvent.seqNum + 1;
        } 
        
        this.eventsLedger.push(remoteEvent);
        //this.network.eventsLedger = this.eventsLedger;
        console.log(this.sequenceNumber);

        const targetSelector = eventObject.target;
        let target: Element = this.svg;
        let e: Event;
        if(eventObject.type.substr(0, 5) === 'touch') {
            e = new TouchEvent(eventObject.type, eventObject as any);
        } else if(eventObject.type.substr(0, 5) === 'mouse') {
            e = new MouseEvent(eventObject.type, eventObject as any);
        } else if(eventObject.type.substr(0, 4) === 'drag') {
            e = new DragEvent(eventObject.type, eventObject as any);
        } else {
            e = new Event(eventObject.type, eventObject as any);
        }

        if(targetSelector) {
            let newTarget: Element|null = document.querySelector(targetSelector);
            if(!newTarget) {
                console.error('element not found', targetSelector);
                return;
            }
            target = newTarget;
        }
        Object.defineProperty(e, 'target', {
            writable: true,
            value: target,
        });
        Object.defineProperty(e, 'view', {
            writable: true,
            value: window,
        });
        (e as any)['desc-received'] = true;
        target.dispatchEvent(e);
    }
}

interface StrippedEvent {
    type: string,
    target: string,
    [key: string]: string|number;
}