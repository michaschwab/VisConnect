import {VisConnectUi} from "./ui";
import {Visconnect} from "./visconnect";
import {VisConnectUtil} from "./util";
import {delayAddEventListener, disableStopPropagation} from "./dom";
var visconnect;
var visconnectUi;

let parts = window.location.href.match(/\?visconnectid=([a-z0-9\-]+)/);
const ownId = [...Array(10)].map(i=>(~~(Math.random()*36)).toString(36)).join('');
const leaderId = parts ? parts[1] : ownId;

(window as any).vc = {
    drag: VisConnectUtil.drag,
    mouse: VisConnectUtil.mouse,
    random: VisConnectUtil.random(leaderId)
};

console.log('init vislink');
disableStopPropagation();
delayAddEventListener().then(() => {
    let el: Element;

    const elsWithAttribute = document.querySelectorAll('[collaboration]');
    const svg = document.getElementsByTagName('svg')[0];
    let safeMode = true;
    let customEvents: string[]|undefined = undefined;
    let ignoreEvents: string[]|undefined = undefined;

    if (elsWithAttribute.length) {
        el = elsWithAttribute[0];
        const val = el.getAttribute('collaboration');
        if(val && val === 'live') {
            safeMode = false;
        }
        const customEventsVal = el.getAttribute('custom-events');
        if(customEventsVal) {
            customEvents = customEventsVal.replace(/ /g, '').split(',');
        }
        const ignoreEventsVal = el.getAttribute('ignore-events');
        if(ignoreEventsVal) {
            ignoreEvents = ignoreEventsVal.replace(/ /g, '').split(',');
        }
    } else if (svg) {
        el = svg;
    } else {
        el = document.body;
    }

    console.log('start visconnect');
    visconnect = new Visconnect(el, ownId, leaderId, safeMode, customEvents, ignoreEvents);

    visconnectUi = new VisConnectUi(visconnect, el);
    visconnect.onEventCancelled = visconnectUi.eventCancelled.bind(visconnectUi);
});
