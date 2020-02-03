import {delayAddEventListener, disableStopPropagation} from "./dom";
import {DescUi} from "./ui";
import {DescVis} from "./descvis";

disableStopPropagation();
delayAddEventListener().then(() => {
    const elsWithAttribute = document.querySelectorAll('[collaboration]');
    const el = elsWithAttribute.length ? elsWithAttribute[0] : document.getElementsByTagName('svg')[0];
    const descvis = new DescVis(el);

    new DescUi(descvis);
});
