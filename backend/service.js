import fs from 'fs';
import jwt from 'jsonwebtoken';
import AsyncLock from 'async-lock';
import { InputError, AccessError } from './error.js';
import { blind, unblind, verify } from 'blind-signatures';
import NodeRSA from 'node-rsa';
import * as crypto from 'crypto';
import { ethers, InfuraProvider } from "ethers";
import { infuraAPIKey, privateKey, factoryContract } from './config.js';
import { helper } from './helper.js';
import { issueVC } from './issue.js';

const lock = new AsyncLock();

const JWT_SECRET = 'thesiswork';
const DATABASE_FILE = './database.json';

const abi = helper('constants/abi.json');
const SPabi = helper('constants/SPabi.json');
const provider = new InfuraProvider("sepolia", infuraAPIKey,);
const signer = new ethers.Wallet(privateKey, provider);

const contract = new ethers.Contract(factoryContract, abi, signer);


// State management 

let users = {};
let sps = {};

const update = (users, sps) =>
  new Promise((resolve, reject) => {
    lock.acquire('saveData', () => {
      try {
        fs.writeFileSync(DATABASE_FILE, JSON.stringify({
          users,
          sps,
        }, null, 2));
        resolve();
      } catch {
        reject(new Error('Writing to database failed'));
      }
    });
  });

export const save = () => update(users, sps);
export const reset = () => {
  update({}, {});
  users = {};
  sps = {};
};

try {
  const data = JSON.parse(fs.readFileSync(DATABASE_FILE));
  users = data.users;
  sps = data.sps;
} catch {
  console.log('WARNING: No database found, create a new one');
  save();
}

// Helper
const dataLock = callback => new Promise((resolve, reject) => {
    lock.acquire('dataLock', callback(resolve, reject));
  });


export const getEmailFromAuthorization = authorization => {
    try {
      const token = authorization.replace('Bearer ', '');
      const { email, } = jwt.verify(token, JWT_SECRET);
      if (!(email in users) && !(email in sps)) {
        throw new AccessError('Invalid Token');
      }
      return email;
    } catch {
      throw new AccessError('Invalid token');
    }
  };

export const login = (email, password) => dataLock((resolve, reject) => {
    if (email in users) {
      if (users[email].password === password) {
        resolve({
            token: jwt.sign({ email, }, JWT_SECRET, { algorithm: 'HS256', }),
            type: 'user',
        });
      }
    } else if (email in sps) {
        if (sps[email].password === password) {
            resolve({
                token: jwt.sign({ email, }, JWT_SECRET, { algorithm: 'HS256', }),
                type: 'sp',
            });
        }
    }
    reject(new InputError('Invalid username or password'));
});

export const register = async (email, password, name, type) => {
    if (email in users || email in sps) {
       throw new InputError('Email address already registered');
    }
    if (type === 'user') {
        users[email] = {
            name,
            password,
          };
    } else {
        const tx = await contract.createServiceProvider(email);
        console.log(`Mining transaction ...`);
        const receipt = await tx.wait();
        console.log(`Mined in block ${receipt.blockNumber}`);
        const tx1 = await contract.getServiceProviderAddress(email);
        sps[email] = {
            name,
            password,
            reviews: [],
            rating: 0,
            contract: tx1,
            pubK: '',
        };
    }
    const token = jwt.sign({ email, }, JWT_SECRET, { algorithm: 'HS256', });
    return (token);
};


// Service provider functions
export const getSPList = () => dataLock((resolve, reject) => {
    resolve(Object.keys(sps).map(key =>  ({
        name: sps[key].name,
        rating: sps[key].rating,
        pubK: sps[key].pubK,
        email: key,
    })));
});

export const getSPInfo = (email) => dataLock((resolve, reject) => {
    const SPdetails = {
        ...sps[email],
    };
    resolve({
        SPdetails
    });
});

const newReviewPayload = (text, rating, hashedText, key, token) => ({
    text,
    rate: rating,
    hash: hashedText,
    reviewKey: key,
    reviewToken: token,
  });

export const addReview = async (email, text, rating, token, key) => {
    // verify the blind signature
    const result = verify({
      unblinded: token,
      N: sps[email].keyN,
      E: sps[email].keyE,
      message: key,
    });
    if (!result) {
      return ('failure');
    }
    var spsLength = Object.keys(sps).length;
    var spsIndex = Math.floor(Math.random() * spsLength);
    var spsEmail = Object.keys(sps)[spsIndex];
    var temp = (sps[email].rating * sps[email].reviews.length + rating) / (sps[email].reviews.length + 1);
    var hashedReview = '0x' + crypto.createHash('sha256').update(JSON.stringify(text)).digest('hex');
    var hashedToken = '0x' + crypto.createHash('sha256').update(JSON.stringify(token)).digest('hex');
    const SPContract = new ethers.Contract(sps[email].contract, SPabi, signer);    
    try {
        const tx = await SPContract.sendReview(hashedReview, Math.round(temp), spsEmail, hashedToken);
        console.log(`Mining transaction ...`);
        const receipt = await tx.wait();
        console.log(`Mined in block ${receipt.blockNumber}`);
        sps[email].reviews.push(newReviewPayload(text, rating, hashedReview, key, token));
        sps[email].rating = Math.round(temp);
        return('success')
    } catch {
        return('failure')
    }
};

export const addKey = (email, key) => dataLock((resolve, reject) => {
    sps[email].pubK = key;
    var tempkey = new NodeRSA();
    tempkey.importKey(key, 'pkcs8-public');
    sps[email].keyN = tempkey.keyPair.n.toString();
    sps[email].keyE = tempkey.keyPair.e.toString();
    resolve('sucess');
});

export const blindToken = (email) => {
    var token = crypto.randomBytes(20).toString('hex');
    const { blinded, r } = blind({
        message: token,
        N: sps[email].keyN,
        E: sps[email].keyE,
    });
    sps[email].blindingFactor = r.toString();
    return({
        token: token,
        blinded: blinded.toString(),
    })
};

export const unblindToken = async (email, token) => {
    const unblinded = unblind({
        signed: token,
        N: sps[email].keyN,
        r: sps[email].blindingFactor,
    });
    delete sps[email].blindingFactor;
    const SPContract = new ethers.Contract(sps[email].contract, SPabi, signer);  
    
    try{
        const tx = await SPContract.createUserToken();
        console.log(`Mining transaction ...`);
        const receipt = await tx.wait();
        console.log(`Mined in block ${receipt.blockNumber}`);
        return({
            unblinded: unblinded.toString(),
            email: email,
        })
    } catch {
        return ({
            unblinded: 'error',
        })
    };
};

export const createtokenVC = (email, token) => {
    var payload = {
        name: sps[email].name,
        token: token,
    }
    return ( issueVC('tokenVC', payload) );
};

export const createKeyVC = (email, key) => {
  var payload = {
      name: sps[email].name,
      key: key,
  }
  return ( issueVC('keyVC', payload) );
};

export const createRepVC = (email) => {
    var payload = {
        name: sps[email].name,
        address: sps[email].contract,
        rating: sps[email].rating
    }
    return ( issueVC('reputationVC', payload) );
};