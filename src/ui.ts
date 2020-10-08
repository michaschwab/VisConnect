import {Visconnect} from './visconnect';
import {VisConnectUtil} from './util';
import {StrippedEvent} from './listener';

export class VisConnectUi {
    private cursorResetTimeout = 0;

    constructor(private visconnect: Visconnect, private element: Element) {
        this.addTemplate();
        this.initiateCursors();

        const protocol = this.visconnect.protocol;
        protocol.communication.onConnectionCallback = this.updateConnections.bind(this);
        protocol.onLoading = this.showLoadingScreen.bind(this);
        protocol.onDoneLoading = this.hideLoadingScreen.bind(this);
        protocol.communication.onLoading = this.showLoadingScreen.bind(this);
        protocol.communication.onDoneLoading = this.hideLoadingScreen.bind(this);

        this.showLoadingScreen('Setting up..');
        this.updateConnections();
    }

    initiateCursors() {
        this.element.addEventListener('mousemove', this.mouseMoved.bind(this));

        const container = document.createElement('div');
        container.id = 'visconnect-cursors';
        document.body.appendChild(container);
    }

    getCursor(participant: string) {
        const elementId = `visconnect-cursor-${participant}`;
        let cursor = document.getElementById(elementId);
        if (!cursor) {
            const cursors = document.getElementById('visconnect-cursors')!;
            cursor = document.createElement('div');
            cursor.style.background = VisConnectUtil.stringToHex(participant);
            cursor.style.width = '5px';
            cursor.style.height = '5px';
            cursor.style.position = 'absolute';
            cursor.style.borderRadius = '3px';
            cursor.style.pointerEvents = 'none';
            cursor.id = elementId;
            cursors.appendChild(cursor);
        }
        return cursor;
    }

    mouseMoved(originalEvent: Event) {
        const event = originalEvent as MouseEvent & {collaboratorId: string};
        const ownId = this.visconnect.protocol.communication.id;
        const collaborator = event['collaboratorId'];
        if (!collaborator || !ownId || ownId === collaborator) {
            return;
        }
        const cursor = this.getCursor(collaborator);
        cursor.style.left = `${event.clientX - 2}px`;
        cursor.style.top = `${event.clientY - 2}px`;
    }

    eventCancelled(event: StrippedEvent) {
        clearTimeout(this.cursorResetTimeout);
        let target: HTMLElement = document.querySelector(event.target) || document.body;
        target.style.setProperty('cursor', 'not-allowed', 'important');
        this.cursorResetTimeout = window.setTimeout(() => {
            target.style.removeProperty('cursor');
        }, 50);
    }

    updateConnections() {
        const connections = this.visconnect.protocol.communication.getNumberOfConnections();
        const collaborators = connections - 1;

        if (collaborators > 0) {
            document.getElementById('visconnect-container')!.style.height = '70px';
            document.getElementById('visconnect-collab-notice')!.style.display = 'inline';
            document.getElementById('visconnect-collab-count')!.innerText = String(collaborators);
        } else {
            document.getElementById('visconnect-container')!.style.height = '50px';
            document.getElementById('visconnect-collab-notice')!.style.display = 'none';
        }
    }

    invite() {
        const communication = this.visconnect.protocol.communication;
        const leaderId = communication.leaderId;
        const logo = document.getElementById('visconnect-logo')!;

        if (!leaderId) {
            const errorElement = document.getElementById('visconnect-not-ready')!;
            logo.style.display = 'none';
            errorElement.style.display = 'inline';

            setTimeout(() => {
                logo.style.display = 'block';
                errorElement.style.display = 'none';
            }, 1000);
            return;
        }

        const url =
            leaderId === communication.id
                ? location.href + '?visconnectid=' + leaderId
                : location.href;
        copyToClipboard(url);

        const inviteLinkCopied = document.getElementById('visconnect-link-copied')!;

        logo.style.display = 'none';
        inviteLinkCopied.style.display = 'inline';

        setTimeout(() => {
            logo.style.display = 'block';
            inviteLinkCopied.style.display = 'none';
        }, 2000);
    }

    showLoadingScreen(message: string) {
        this.hideLoadingScreen();

        const container = document.createElement('div');
        container.id = 'visconnect-loadingscreen';
        document.body.appendChild(container);

        container.innerHTML = `
<style>
#background {
    background: #f5f5f5;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
}
p {
    text-align: center;
    position: fixed;
    top: 40%;
    width: 100%;
    left: 0;
}
</style>
<div id="background">
    <p>
        <b>VisConnect Loading:</b>
        <br /><br />
        ${message}
    </p>
</div>
    `;
    }

    hideLoadingScreen() {
        const loadingscreen = document.getElementById('visconnect-loadingscreen');
        if (!loadingscreen) {
            return;
        }
        loadingscreen.parentNode!.removeChild(loadingscreen);
    }

    addTemplate() {
        const container = document.createElement('div');
        container.id = 'visconnect-container';

        container.innerHTML = `
<a id="visconnect-invite">
    <!--<svg id="visconnect-logo" width="50" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="link" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline&#45;&#45;fa fa-link fa-w-16 fa-2x"><path fill="#fff" d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z" class=""></path></svg>-->
    <svg id="visconnect-logo" width="50" version="1.1" viewBox="0 0 55.55724 55.55724" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <g transform="translate(-15.5 -20.905)">
            <path d="m49.236 53.67s-6.0878-19.94-22.215-6.3478c-10.3 8.6812-12.464 16.499-6.203 23.516 7.1388 8.0014 16.301 3.8953 25.966-10.387" fill="none" stroke="#36b" stroke-width="3"/>
            <path d="m36.975 38.666s14.57-21.929 26.543-12.407c11.973 9.5217 1.9956 17.866-2.3081 22.362-6.4915 6.7806-14.408 11.996-20.629 5.0494-3.8794-4.3324-4.3277-7.6462-4.3277-7.6462" fill="none" stroke="#36b" stroke-width="3"/>
            <path d="m61.313 40.246h-3.6787l1.936 4.6647c0.13471 0.32337-0.01958 0.68598-0.32747 0.82317l-1.7049 0.73499c-0.31772 0.13713-0.67422-0.01936-0.80906-0.33321l-1.8397-4.4295-3.0052 3.0575c-0.40047 0.40736-1.05 0.09324-1.05-0.44098v-14.738c0-0.56252 0.69082-0.83679 1.0499-0.44098l9.8624 10.034c0.39783 0.38345 0.10406 1.0682-0.43342 1.0682z" fill="#fff" stroke="#000"/>
            <path d="m37.341 62.869h-3.6787l1.936 4.6647c0.13472 0.32337-0.01958 0.68598-0.32747 0.82317l-1.7049 0.73499c-0.31772 0.13713-0.67422-0.01936-0.80906-0.33321l-1.8397-4.4295-3.0052 3.0575c-0.40047 0.40736-1.05 0.09324-1.05-0.44098v-14.738c0-0.56253 0.69082-0.83679 1.0499-0.44098l9.8624 10.034c0.39783 0.38345 0.10406 1.0682-0.43342 1.0682z" fill="#fff" stroke="#000"/>
        </g>
    </svg>
</a>
<span id="visconnect-link-copied">Invite Link Copied.</span>
<span id="visconnect-not-ready">Not yet ready...</span>
<span id="visconnect-collab-notice"><span id="visconnect-collab-count"></span> connected</span>

<style>
#visconnect-container {
    position: fixed;
    right: 10px;
    bottom: 100px;
    background: rgba(120,120,120,0.5);
    border: 1px solid #ccc;
    border-radius: 10px;
    width: 80px;
    height: 50px;
    padding: 10px;
    transition: height 500ms;
    color: #fff;
    font-family: 'Times New Roman',Times,serif;
}
#visconnect-container, #visconnect-container * {
    box-sizing: content-box;
}
#visconnect-logo {
    padding-left: 15px;
    display: block;
    background: transparent;
}
#visconnect-invite:hover {
    cursor: pointer;
}
#visconnect-invite:hover #visconnect-logo path {
    stroke: #000;
} 
#visconnect-link-copied, #visconnect-collab-notice, #visconnect-not-ready {
    display: none;
}
#visconnect-collab-notice {
    font-size: 11pt;
    position: relative;
    top: 5px;
    display: inline-block;
    width: 100px;
}
</style>`;
        document.body.appendChild(container);
        document.getElementById('visconnect-invite')!.onclick = this.invite.bind(this);
    }
}

// From https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
const copyToClipboard = (str: string) => {
    const el = document.createElement('textarea');
    el.value = str;
    //console.log(str);
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    const selection = document.getSelection();
    const selected = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : false;
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    if (selected && selection) {
        selection.removeAllRanges();
        selection.addRange(selected);
    }
};
