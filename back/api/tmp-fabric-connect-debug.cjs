const path = require('path');
const fs = require('fs');
const { Gateway, Wallets } = require('fabric-network');
const FABRIC_CONFIG_PATH = path.resolve(__dirname, '..', '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com');
const FABRIC_USER_ID = 'User1@org1.example.com';
const FABRIC_CHANNEL = 'nofake-channel';
(async () => {
  try {
    const certDir = path.join(FABRIC_CONFIG_PATH, 'users', FABRIC_USER_ID, 'msp', 'signcerts');
    const keyDir = path.join(FABRIC_CONFIG_PATH, 'users', FABRIC_USER_ID, 'msp', 'keystore');
    console.log('certDir', certDir, fs.existsSync(certDir) && fs.readdirSync(certDir));
    console.log('keyDir', keyDir, fs.existsSync(keyDir) && fs.readdirSync(keyDir));
    const wallet = await Wallets.newInMemoryWallet();
    const certificate = fs.readFileSync(path.join(certDir, fs.readdirSync(certDir)[0]), 'utf8');
    const privateKeyFile = fs.readdirSync(keyDir).find((name) => name.endsWith('.pem') || name.endsWith('.key') || name.endsWith('_sk'));
    console.log('privateKeyFile', privateKeyFile);
    const privateKey = fs.readFileSync(path.join(keyDir, privateKeyFile), 'utf8');
    await wallet.put('appUser', { credentials: { certificate, privateKey }, mspId: 'Org1MSP', type: 'X.509' });
    const ccp = JSON.parse(fs.readFileSync(path.join(FABRIC_CONFIG_PATH, 'connection-org1.json'), 'utf8'));
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });
    const network = gateway.getNetwork(FABRIC_CHANNEL);
    console.log('network type', typeof network, Object.getOwnPropertyNames(network).filter((n) => n.includes('get')));
    if (network && typeof network.getContract === 'function') {
      console.log('getContract exists');
    } else {
      console.log('getContract missing', network && network.getContract);
    }
    gateway.disconnect();
  } catch (err) {
    console.error('ERROR', err);
  }
})();
