import {delayAddEventListener, disableStopPropagation} from "./dom";
import {DescUi} from "./ui";
import {DescVis} from "./descvis";

disableStopPropagation();
delayAddEventListener().then(() => {
    const descvis = new DescVis(document.getElementsByTagName('svg')[0]);

    new DescUi(descvis);
});
