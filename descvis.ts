interface DescEvent {
    seqNum: number,
    event: StrippedEvent,
    sender: string
}

class DescVis {
    private network: DescNetwork = new DescNetwork(this.receiveEvent.bind(this), this.onNewConnection.bind(this));
    private eventsQueue: DescEvent[] = [];
    private sequenceNumber: number = 0;
    private eventsLedger: DescEvent[] = [];
    private leasees = new Map<HTMLElement, string>();

    constructor(private svg: SVGElement) {
        const listener: DescListener = new DescListener(this.svg, this.hearEvent.bind(this));
    }

    hearEvent(eventObj: StrippedEvent, event: Event) {
        if(!event.target) {
            return new Error('event has no target');
        }
        const target = event.target as HTMLElement;
        const peerId = this.network.id;

        if(!this.leasees.has(target)) {
            this.leasees.set(target, peerId);
        }
        if(this.leasees.get(target) === peerId) {
            const newEvent: DescEvent = {
                'seqNum': this.sequenceNumber,
                'event': eventObj,
                'sender': this.network.id
            };
            this.sequenceNumber++;
            this.eventsLedger.push(newEvent);
            //this.network.eventsLedger = this.eventsLedger;
            console.log(this.sequenceNumber);
            this.network.broadcastEvent(newEvent);
        } else {
            // prevent event
            console.log('Can not edit this element because I am not the leader.');
            (event as any)['stopImmediatePropagationBackup']();
            event.stopPropagation();
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
            let newTarget: Element|null = document.querySelector(targetSelector as string);
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
    [key: string]: string|number;
}