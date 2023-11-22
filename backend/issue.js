import { defaultDocumentLoader, issue } from '@digitalbazaar/vc';
import pkg from 'jsonld-signatures';
const {extendContextLoader} = pkg;
import {Ed25519VerificationKey2018} from
  '@digitalbazaar/ed25519-verification-key-2018';
import {Ed25519Signature2018} from '@digitalbazaar/ed25519-signature-2018';
import { createTokenCredential } from './tokenCredential.js';
import { createReputationCredential } from './reputationCredential.js';
import { createKeyCredential } from './keyCredential.js';


const customDocuments = {
    "https://w3id.org/demoSystem/v1":  {
        "@context": {
          "@version": 1.1,
          "@protected": true,

          "ex": "https://example.org/examples#",
          "schema": "http://schema.org/",
          "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      
          "ReviewTokenCredential":"ex:ReviewTokenCredential",
          "ReviewKeyCredential": "ex:ReviewKeyCredential",
          "ReputationCredential":"ex:ReputationCredential",

          "serviceProvider": "schema:email",
          "reviewToken": "schema:text",
          "reviewKey": "schema:text",
          "contractAddress": "schema:text",
          "rating": "schema:rating",
        }
      },
      "https://example.edu/issuers/demosystem":  {
        '@context': 'https://w3id.org/security/v2',
        id: "did:example:489398593",
        assertionMethod: ["https://example.edu/issuers/keys/1"]
      },
}


const documentLoader = extendContextLoader(async url => {
    if(customDocuments[url]) {
      return {
        contextUrl: null,
        documentUrl: url,
        document: customDocuments[url]
      };
    }
    return defaultDocumentLoader(url);
  });

const keyPair = await Ed25519VerificationKey2018.from({
    "id": "https://example.edu/issuers/keys/1",
    "type": "Ed25519VerificationKey2018",
    "controller": "https://example.edu/issuers/demosystem",
    "publicKeyBase58": "AoncetDEamr1hreoMiLocvQvCLEu5i5FuQ232zdqie7g",
    "privateKeyBase58": "53KBp86VkzDKthrZdQCKv4UaAWd74DWCqgbmYmXuLytgbU7pFghAWs23Tdd9iacMLZtkvwdo5vCvDQ8vj24HdJYv"
});

const suite = new Ed25519Signature2018({verificationMethod: keyPair.id, key: keyPair});

export async function issueVC(type, payload) {
    var curDate = new Date().toISOString();
    suite.date = curDate;
    var credential = {};

    if (type === 'tokenVC') {
        credential = createTokenCredential(payload.name, payload.token, curDate);
    } else if (type === 'reputationVC') {
        credential = createReputationCredential(payload.name, payload.address, payload.rating, curDate);
        console.log(credential);
    } else if (type === 'keyVC') {
        credential = createKeyCredential(payload.name, payload.key, curDate);
    }

    const signedVC = await issue({credential, suite, documentLoader});
    const vcJSON = JSON.stringify(signedVC, null, 2)
    return vcJSON;

}
