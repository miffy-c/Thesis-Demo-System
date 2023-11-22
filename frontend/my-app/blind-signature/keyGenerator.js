// Instructions:
// 1. Download the program below into a javascript file.
// 2. Run 'npm install blind-signature' in the terminal.
// 3. Run 'node keyGenerator.js' in the terminal.
// 4. Program will ouput a public and private key which you will need to keep and use for this system. 
// Upload the public key to the system for storage and keep private key in a safe location for signing. 

const BlindSignature = require('blind-signatures');

const k = BlindSignature.keyGeneration({ b: 2048 })
console.log(k.exportKey('pkcs8-public'))
console.log(k.exportKey('pkcs8-private'))
