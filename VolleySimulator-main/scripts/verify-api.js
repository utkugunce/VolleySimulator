const http = require('http');

const data = JSON.stringify({
    targetTeam: "BİZİMKENT VOLEYBOL",
    teams: [
        { name: "ARNAVUTKÖY BLD.", points: 42, wins: 14, setsWon: 42, setsLost: 5, groupName: "1. GRUP" },
        { name: "BİZİMKENT VOLEYBOL", points: 1, wins: 0, setsWon: 2, setsLost: 40, groupName: "1. GRUP" }
    ],
    fixture: [
        { homeTeam: "ARNAVUTKÖY BLD.", awayTeam: "BİZİMKENT VOLEYBOL", isPlayed: false }
    ]
});

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/calculate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
    },
};

console.log("Sending request to http://localhost:4000/api/calculate...");

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('RESPONSE BODY:');
        console.log(body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
