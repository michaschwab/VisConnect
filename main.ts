import {DescUi} from "./ui";
import {DescVis} from "./descvis";
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
    visconnect = new DescVis(el, safeMode);

    visconnectUi = new DescUi(visconnect, el);
    visconnect.onEventCancelled = visconnectUi.eventCancelled.bind(visconnectUi);
});
