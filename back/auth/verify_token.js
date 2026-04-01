const jwt = require('jsonwebtoken'); // npm install jsonwebtoken 필요
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://authjs.web3auth.io/jwks'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// 프론트엔드에서 보낸 토큰을 검증하는 함수
function verifyUserToken(token) {
    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) return console.error("검증 실패:", err);
        console.log("신뢰할 수 있는 사용자:", decoded.email);
    });
}
