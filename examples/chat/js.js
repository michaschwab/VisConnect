document.body.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const data = {
            sender: document.getElementById('chat-nick').value,
            text: document.getElementById('chat-input').value,
            time: Date.now()
        };
        const event = new CustomEvent('chat-message', {detail: data});
        document.body.dispatchEvent(event);
    }
});

const messages = [];
document.body.addEventListener('chat-message', (e) => {
    messages.push(e.detail);
    rerender();
});

function rerender() {
    const chat = d3.select('#chat');

    const msgs = chat.selectAll('.msg').data(messages);
    msgs.enter().append('div').attr('class', 'msg').html((d) => `<b>${d.sender}</b>: ${d.text}`);
}