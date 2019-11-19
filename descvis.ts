interface event {
    seqNum: number,
    event: SerializedEvent,
    sender: string
}

class DescVis {
    private connection: DescConnection = new DescConnection(this.receiveEvent.bind(this));
    private eventsQueue: event[] = [];
    private sequenceNumber: number = 0;
    private eventsLedger: event[] = [];

    constructor(private svg: SVGElement) {
        const listener: DescListener = new DescListener(this.svg, this.hearEvent.bind(this));
    }

    hearEvent(eventObj: SerializedEvent) {
        const newEvent: event = {
            'seqNum': this.sequenceNumber,
            'event': eventObj,
            'sender': this.connection.id
        }
        this.sequenceNumber++;
        this.eventsLedger.push(newEvent);
        this.connection.eventsLedger = this.eventsLedger;
        console.log(this.sequenceNumber);
        this.connection.broadcastEvent(newEvent);
    }

    receiveEvent(remoteEvent: event) {
        let eventObject: SerializedEvent = remoteEvent.event;

        if (remoteEvent.seqNum >= this.sequenceNumber){
            this.sequenceNumber = remoteEvent.seqNum + 1;
        } 
        
        this.eventsLedger.push(remoteEvent);
        this.connection.eventsLedger = this.eventsLedger;
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

interface SerializedEvent {
    type: string,
    [key: string]: string|number;
}