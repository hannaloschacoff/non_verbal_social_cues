Project description: Meet a robot that reads social cues through radar and gaze tracking, reacting to perceived behavior. A live visualization reveals its reasoning, mirroring how cognitive biases shape interaction. This platform could explores human-robot interaction from multiple perspectives: first-person, third-person, each with different interpretations. Like our subjective views of others, there's no single objective truth. It invites reflection of how humans and machines construct meaning from ambiguous signals, and the invisible lenses through which we judge ourselves and others.
More information on project: https://projects.id.tue.nl/demoday/WVI7EE
See portfolio: www.hannaloschacoff.com

This project has three software elements:
1. Index.html (Front-end visualizing data input and perspective of robot), the orientation of the visualization is vertical
2. Server.js (Javascript file sending and receiving data through serial communication)
3. Through_your_eyes.ino (ESP32 file resulting in robot reaction with movement)

Setup Local Server:
1. On Visual Studio download the extension Live Server
2. With the index.html and server.js files open in Visual Studio righ click and click "Open with Live Server"

Serial communication setup:
1.  Download the JavaScript runtime environment Node.js (https://nodejs.org/en/download)
2. In the server.js file change the COM value to the port your ESP32 is connected to: 
"const SERIAL_PATH = 'COM10';" // line 6, change the COM your ESP32 is connected to
3. On your computer's Command Prompt insert the following and hit enter:
cd "C:\Users\" //enter the location of your folder with the index.html and server.js files
node -v 
npm -v
npm init -y
npm install ws serialport @serialport/parser-readline
node server.js

Setup Gaze Tracking:
1. With the webpage open (after clicking "Open with Live Server" click "Start Gaze" 
2. Then click "Calibrate" and look at the yellow dots while you click on them
3. Now test the tracking by looking around, the yellow arrow should be pointing in the direction your looking in



What you need (Electronics):
1. ESP32 DEVKIT1 (Connected to computer for serial communication)
2. Power source (5V and 6A)
3. 1x MG996R Servo (Non continuous) (https://www.tinytronics.nl/nl/mechanica-en-actuatoren/motoren/servomotoren/mg996r-servo)
4. 2x S3003 Servo - 6kg - Continuous (https://www.tinytronics.nl/nl/mechanica-en-actuatoren/motoren/servomotoren/s3003-servo-6kg-continuous)
5. Ai-Thinker Rd-03D 24GHz Radar Sensor Module (https://www.tinytronics.nl/nl/sensoren/beweging/ai-thinker-rd-03d-24ghz-radar-sensor-module)
6. INA3221 I2C DC Stroom - en Spanningssensor Module - 1.6A - 3 Kanalen (https://www.tinytronics.nl/nl/sensoren/stroom-spanning/ina3221-i2c-dc-stroom-en-spanningssensor-module-1.6a-3-kanalen)
7. A external webcam
A schematic of how to connect the electronics can be found in the repository,

What you need (Mechanisms)- 3D print them from the download folder:
1. 2x Bobbin mechanism
2. 2x Pulley
3. 1m Non elastic string 

What you need (Casing)
1. 11m Aluminium Stanley Profile by Item
2. 3x 700x400x2mm MDF plates
3. 1x Cardboard cat toy (https://www.bol.com/nl/nl/p/opvouwbare-krabpaal-kattenspeelgoed-kattenspeeltjes-2-in-1-kattenspeelgoed-krabhuis-voor-katten-met-bellenbal-draagbare-krabpaal-voor-katten/9300000237265371/?Referrer=ADVNLGOO002041-S--9300000237265371-PMAX-C-22294751171&gad_source=1&gad_campaignid=22298487985&gbraid=0AAAAAD5OnmOrczGYXDRYsop85qnTNeIVW&gclid=Cj0KCQiAxonKBhC1ARIsAIHq_lsoz6fFqy_Zmz80PzEYDPPxNsxXXYirF5QMlXVqzFxcatytuAMfGhEaArOUEALw_wcB)
4. 27 Inch monitor screen (USE IN LANDSCAPE DISPLAY)
