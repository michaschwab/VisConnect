import {StrippedEvent} from "./listener";

export function delayAddEventListener() {
    // The visualization's event listeners need to be called after VisConnect's event listeners.
    // For this reason, we delay calling event listeners that are added before VisConnect is started.
    (Element as any).prototype['addEventListenerBackup'] = Element.prototype.addEventListener;
    Element.prototype.addEventListener = function(this: Element, eventName: string, callback: () => void) {
        //console.log('doing a delayed execution on ', eventName, this);
        const that = this;
        setTimeout(function() {
            (Element as any).prototype['addEventListenerBackup'].call(that, eventName, callback);
        }, 110);
    } as any;

    // After the visualization code is run, reset the addEventListener function to its normal functionality, and start
    // VisConnect.
    return new Promise<void>(resolve => {
        window.setTimeout(() => {
            Element.prototype.addEventListener = (Element as any).prototype['addEventListenerBackup'];
            resolve();
        }, 100);
    });
}

export function disableStopPropagation() {
    // Prevent d3 from blocking VisConnect and other code to have access to events.
    (Event as any).prototype['stopImmediatePropagationBackup'] = Event.prototype.stopImmediatePropagation;
    Event.prototype.stopImmediatePropagation = () => {};
}

export function stopPropagation(event: Event) {
    (event as Event & {stopImmediatePropagationBackup: () => void})['stopImmediatePropagationBackup']();
    event.stopPropagation();
}

export function recreateEvent(eventObject: StrippedEvent, target: Element): Event {
    const targetSelector = eventObject.target;
    let e: Event;
    if(eventObject.type.substr(0, 5) === 'touch') {
        try {
            e = document.createEvent('TouchEvent');
            e.initEvent(eventObject.type, true, false);
            for(const prop in eventObject) {
                if(prop !== 'isTrusted' && eventObject.hasOwnProperty(prop)) {
                    Object.defineProperty(e, prop, {
                        writable: true,
                        value: eventObject[prop],
                    });
                }
            }
        } catch(error) {
            // Touch probably not supported.
            let newType = 'mousemove';
            if(eventObject.type === 'touchstart') {
                newType = 'mousedown';
            } else if(eventObject.type === 'touchend') {
                newType = 'mouseup';
            }
            eventObject.type = newType;
            if(eventObject.touches[0]) {
                eventObject.clientX = eventObject.touches[0].clientX;
                eventObject.clientY = eventObject.touches[0].clientY;
            }

            e = new MouseEvent(eventObject.type, eventObject as any);
        }
        //e = new TouchEvent(eventObject.type, eventObject as any);
    } else if(eventObject.type.substr(0, 5) === 'mouse' || eventObject.type === 'click') {
        e = new MouseEvent(eventObject.type, eventObject as any);
    } else if(eventObject.type.substr(0, 4) === 'drag') {
        e = new DragEvent(eventObject.type, eventObject as any);
    } else {
        e = new Event(eventObject.type, eventObject as any);
    }
    if(eventObject.detail) {
        Object.defineProperty(e, 'detail', {
            writable: true,
            value: eventObject.detail,
        });
    }

    if(targetSelector) {
        let newTarget: Element|null = document.querySelector(targetSelector);
        if(!newTarget) {
            console.error('element not found', targetSelector);
            //throw new Error('element not found');
            newTarget = document.body;
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
    return e;
}