const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if(qr) {
            qrcode.generate(qr, {small: true});
        }
        
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode!== DisconnectReason.loggedOut;
            console.log('Conexión cerrada. Reconectando...', shouldReconnect);
            if(shouldReconnect) {
                startBot();
            }
        } else if(connection === 'open') {
            console.log('Bot Raptor conectado a WhatsApp ✅');
        }
    });

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && msg.message) {
            console.log('Mensaje recibido:', msg.message);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Hola! Soy Raptor Bot 🤖' });
        }
    });
}

startBot();
