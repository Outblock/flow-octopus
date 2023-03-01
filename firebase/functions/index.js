const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./service.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

exports.accountCreationTrigger = functions.firestore
  .document('accounts_creation/{txId}')
  .onCreate((snap, context) => { 
    const data = snap.data();
    const sharedAddress = data.address;

    const acc = {} 
    for (const account of data.accounts) {
        if (account.address in acc) {
            acc[account.address].push(account)
        } else {
            acc[account.address] = [account]
        }
    }

    for (const [userAddress, accounts] of Object.entries(acc)) {
        const doc = db.doc(`accounts/${userAddress}`)
        doc.set({
            [sharedAddress]: {
                timestamp: FieldValue.serverTimestamp(),
                createTxId: data.id,
                ...accounts
            }
        }, {merge: true})

        doc.set({sharedAccount: FieldValue.arrayUnion(sharedAddress)}, {merge: true})
    }
});