//download Node.js
//download Visual Studio extension "Live Server"

const WebSocket = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const WS_PORT = 8765;
const SERIAL_PATH = 'COM10'; // change to COM ESP32 is connectyed to
const SERIAL_BAUD = 115200;

const wss = new WebSocket.Server({ port: WS_PORT }, () => {
  console.log('WS listening on ws://localhost:' + WS_PORT);
});

let serial = null;
let serialOpening = false;
let retryDelay = 1000;
const MAX_RETRY_DELAY = 5000;

// broadcast helper
function broadcastJSON(obj) {
  const str = JSON.stringify(obj);
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(str); });
}

// opens serial port
function openSerial() {
  if (serial && serial.isOpen) return;
  if (serialOpening) return;
  serialOpening = true;
  try {
    serial = new SerialPort({ path: SERIAL_PATH, baudRate: SERIAL_BAUD, autoOpen: false });

    // attach parser after creating port

    const parser = serial.pipe(new ReadlineParser({ delimiter: '\n' }));

    parser.on('data', line => {
      line = line.trim();
      
      // parse STATE: messages from ESP32
      if (line.startsWith('STATE:')) {
        const state = line.replace('STATE:', '').trim();
        broadcastJSON({ type: 'state', data: state });
        console.log('→ Browser: State =', state);
      }
      // parse GAZE_COUNT: messages from ESP32
      else if (line.startsWith('GAZE_COUNT:')) {
        const count = parseInt(line.replace('GAZE_COUNT:', '').trim());
        broadcastJSON({ type: 'gazeFollowCount', data: count });
        console.log('→ Browser: Gaze count =', count);
      }
      // parse radar data (format: X,Y,Speed,Acceleration)
      else if (line.includes(',') && !isNaN(line.split(',')[0])) {
        broadcastJSON({ type: 'radar', data: line });
        // console.log('Serial -> Browser:', line); 
      }
      // log other messages but don't send to browseer
      else if (line.length > 0) {
        console.log('ESP32:', line);
      }
    });

    serial.on('open', () => {
      console.log('Serial open', SERIAL_PATH);
      serialOpening = false;
      retryDelay = 1000; // reset backoff
    });

    serial.on('error', err => {
      console.error('Serial error:', err.message);
      cleanupSerial();
      scheduleReconnect();
    });

    serial.on('close', () => {
      console.log('Serial closed');
      cleanupSerial();
      scheduleReconnect();
    });

    serial.open(err => {
      serialOpening = false;
      if (err) {
        console.error('Serial open failed:', err.message);
        cleanupSerial();
        scheduleReconnect();
      }
    });
  } catch (e) {
    serialOpening = false;
    console.error('Serial exception:', e.message || e);
    cleanupSerial();
    scheduleReconnect();
  }
}

function cleanupSerial() {
  try {
    if (serial) {
      serial.removeAllListeners();
      // unpipe parser if present
      try { serial.unpipe(); } catch (e) {}
      if (serial.isOpen) {
        try { serial.close(); } catch(e) {}
      }
    }
  } catch (e) {}
  serial = null;
  serialOpening = false;
}

function scheduleReconnect() {
  setTimeout(() => {
    console.log('Attempting to reopen serial port', SERIAL_PATH);
    openSerial();
  }, retryDelay);
  retryDelay = Math.min(MAX_RETRY_DELAY, retryDelay * 2);
}

// start initial open attempt
openSerial();

wss.on('connection', ws => {
  console.log('Client connected');
  
  ws.on('message', m => {
    let o;
    try { o = JSON.parse(m); } catch (e) { return; }
    
    // handle incoming gaze and proxemics data from browser
    if (o.type === 'gaze' || o.type === 'proxemics' || o.type === 'control') {
      if (serial && serial.isOpen) {
        const message = `${o.type}:${o.data}\n`;
        serial.write(message, err => {
          if (err) {
            console.error('Write error:', err.message);
          } else {
            console.log('✓ Sent to ESP32:', message.trim());
          }
        });
      } else {
        console.log('✗ Serial not open, cannot send:', o.type, o.data);
      }
    }
    
    // legacy write support
    
    if (o.type === 'write' && serial && serial.isOpen) {
      serial.write(String(o.line) + '\n', err => { 
        if (err) console.error('Write error:', err.message); 
      });
    }
  });
  
  ws.on('close', () => console.log('Client disconnected'));
});
