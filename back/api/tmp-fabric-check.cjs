const path = require('path');
const fs = require('fs');
const cfg = path.resolve(__dirname, '..', '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com');
console.log('cfg', cfg);
console.log('signcerts exists', fs.existsSync(path.join(cfg, 'users', 'User1@org1.example.com', 'msp', 'signcerts')));
console.log('keystore exists', fs.existsSync(path.join(cfg, 'users', 'User1@org1.example.com', 'msp', 'keystore')));
