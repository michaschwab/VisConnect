export class DescUi {
    constructor() {
        this.addTemplate();
    }

    invite() {
        copyToClipboard('some string');

        const inviteLink = document.getElementById('invite')!;
        inviteLink.innerText = 'Invite Link Copied.';

        setTimeout(() => inviteLink.innerText = 'Collaborate', 2000);
    }

    addTemplate() {
        const template = `
<div id="desc-container">
    <a id="invite">Collaborate</a>
</div>
<style>
#desc-container {
    position: fixed;
    right: 10px;
    bottom: 100px;
    background: rgba(120,120,120,0.5);
    border: 1px solid #ccc;
    border-radius: 6px;
    width: 50px;
    height: 50px;
}
</style>`;

        document.body.innerHTML += template;
        document.getElementById('invite')!.onclick = this.invite.bind(this);
    }
}

// From https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
const copyToClipboard = (str: string) => {
    const el = document.createElement('textarea');
    el.value = str;
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