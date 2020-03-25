import {VisConnectUi} from "./ui";
import {Visconnect} from "./visconnect";
import {VisConnectUtil} from "./util";
import {delayAddEventListener, disableStopPropagation} from "./dom";
var visconnect;
var visconnectUi;
(window as any).vc = {drag: VisConnectUtil.drag, mouse: VisConnectUtil.mouse};

console.log('init vislink');
disableStopPropagation();
delayAddEventListener().then(() => {
    let el: Element;

    const elsWithAttribute = document.querySelectorAll('[collaboration]');
    const svg = document.getElementsByTagName('svg')[0];
    let safeMode = true;

    if (elsWithAttribute.length) {
        el = elsWithAttribute[0];
        const val = el.getAttribute('collaboration');
        if(val && val === 'live') {
            safeMode = false;
        }
    } else if (svg) {
        el = svg;
    } else {
        el = document.body;
    }

    console.log('start visconnect');
    visconnect = new Visconnect(el, safeMode);

    visconnectUi = new VisConnectUi(visconnect, el);
    visconnect.onEventCancelled = visconnectUi.eventCancelled.bind(visconnectUi);
});
