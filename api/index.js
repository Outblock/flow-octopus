import * as fcl from '@onflow/fcl'
import { UInt64, Address, String, UFix64, Array, UInt8 } from '@onflow/types'
import { buildAndExecScript } from './scripts'
import { buildAndSendTrx, buildAndSendTrxWithId, transactions } from './transactions'
import {
  referAddr,
  getSupportTokenConfig,
  getGraffleUrl,
  nftAPI,
} from '../config/constants'
import { isFlowAddr, getQuery, db } from '../utils'
import { namehash } from '../utils/hash'
import axios from 'axios'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import * as sdk from '@onflow/sdk';
// multi

export const createAccount = async (
  pubKeys,
  signatureAlgorithms,
  hashAlgorithms,
  weights,
) => {
  const res = await buildAndSendTrxWithId('create_account', [
    fcl.arg(pubKeys, Array(String)),
    fcl.arg(signatureAlgorithms, Array(UInt8)),
    fcl.arg(hashAlgorithms, Array(UInt8)),
    fcl.arg(weights, Array(UFix64)),
  ])
  return res
}

//

export const queryGraffle = async (params) => {
  let url = getGraffleUrl()
  let res = await getQuery(url, params)
  return res
}

export const queryRootDomains = async () => {
  const res = await buildAndExecScript('query_root_domains')
  return res
}

export const queryRootVaultBalance = async (rootId) => {
  const res = await buildAndExecScript('query_root_vault_balance', [
    fcl.arg(Number(rootId), UInt64),
  ])
  return res
}

export const checkDomainCollection = async (address) => {
  const res = await buildAndExecScript('check_domain_collection', [
    fcl.arg(address, Address),
  ])
  return res
}

export const getUserDomainIds = async (address) => {
  const res = await buildAndExecScript('get_user_domain_ids', [
    fcl.arg(address, Address),
  ])
  return res
}

export const getUserDomainsInfo = async (address) => {
  const res = await buildAndExecScript('query_user_domains_info', [
    fcl.arg(address, Address),
  ])
  return res
}

export const queryFlowBalence = async (address) => {
  const res = await buildAndExecScript('query_flow_balance', [
    fcl.arg(address, Address),
  ])
  return res
}

export const queryBals = async (address, tokens = []) => {
  const tokenTypes = getSupportTokenConfig()
  let keys = tokens

  let reqArr = []

  keys = Object.keys(tokenTypes)
  reqArr = keys.map((key) => {
    return queryFTBalence(address, tokenTypes[key])
  })

  const resArr = await Promise.all(reqArr)
  let bals = {}

  keys.map((k, idx) => {
    bals[k] = resArr[idx]
  })

  return bals
}

export const queryDomainRecord = async (name, root) => {
  const res = await buildAndExecScript('query_domain_record', [
    fcl.arg(name, String),
    fcl.arg(root, String),
  ])
  return res
}

export const queryFTBalence = async (address, conf) => {
  const res = await buildAndExecScript(
    'query_ft_balance',
    [fcl.arg(address, Address)],
    {
      tokenConfig: conf,
    },
  )
  return res
}

export const getDomainInfo = async (hash) => {
  const res = await buildAndExecScript('query_domain_info', [
    fcl.arg(hash, String),
  ])
  return res
}
export const getDomainDeprecatedInfo = async (hash, id) => {
  const res = await buildAndExecScript('query_domain_deprecated_info', [
    fcl.arg(hash, String),
    fcl.arg(id, UInt64),
  ])
  return res
}

export const getUserDefaultDomain = async (address) => {
  const res = await buildAndExecScript('get_default_flowns_name', [
    fcl.arg(address, Address),
  ])
  return res
}

export const getDomainLength = async (hash) => {
  const res = await buildAndExecScript('get_domain_length', [
    fcl.arg(hash, String),
  ])
  return res
}

export const queryDomainAvailable = async (hash) => {
  const res = await buildAndExecScript('query_domain_available', [
    fcl.arg(hash, String),
  ])
  return res
}

export const getDomainPrice = async (id, name) => {
  const res = await buildAndExecScript('get_domain_price', [
    fcl.arg(id, UInt64),
    fcl.arg(name, String),
  ])
  return res
}

export const getDomainAvaliableWithRaw = async (name, root) => {
  const res = await buildAndExecScript('query_domain_available_with_raw', [
    fcl.arg(name, String),
    fcl.arg(root, String),
  ])
  return res
}

export const calcHash = async (name, root) => {
  const res = await buildAndExecScript('calc_hash', [
    fcl.arg(name, String),
    fcl.arg(root, String),
  ])
  return res
}

export const initDomainCollection = async () => {
  const res = await buildAndSendTrx('init_domain_collection', [])
  return res
}

export const setDomainAddress = async (hash, chainType, address) => {
  const res = await buildAndSendTrx('set_domain_address', [
    fcl.arg(hash, String),
    fcl.arg(chainType, UInt64),
    fcl.arg(address, String),
  ])
  return res
}

export const removeDomainAddress = async (hash, chainType) => {
  const res = await buildAndSendTrx('remove_domain_address', [
    fcl.arg(hash, String),
    fcl.arg(chainType, UInt64),
  ])
  return res
}

export const setDomainText = async (hash, key, obj) => {
  const res = await buildAndSendTrx('set_domain_text', [
    fcl.arg(hash, String),
    fcl.arg(key, String),
    fcl.arg(JSON.stringify(obj), String),
  ])
  return res
}

export const renewDomain = async (id, hash, duration, amount) => {
  const res = await buildAndSendTrx('renew_domain_with_hash', [
    fcl.arg(hash, String),
    fcl.arg(duration, UFix64),
    fcl.arg(amount, UFix64),
    fcl.arg(referAddr, Address),
  ])
  return res
}

export const batchRenewDomain = async (names, duration) => {
  const res = await buildAndSendTrx('batch_renew_domain_with_hash', [
    fcl.arg(
      names.map((n) => namehash(n)),
      Array(String),
    ),
    fcl.arg(duration, UFix64),
    fcl.arg(referAddr, Address),
  ])
  return res
}

export const registerDomain = async (id, hash, duration, amount) => {
  const res = await buildAndSendTrx('register_domain', [
    fcl.arg(id, UInt64),
    fcl.arg(hash, String),
    fcl.arg(duration, UFix64),
    fcl.arg(amount, UFix64),
    fcl.arg(referAddr, Address),
  ])
  return res
}

export const widhdrawDomainVault = async (hash, token, amount) => {
  const tokenTypes = getSupportTokenConfig()
  const key = tokenTypes[token].type
  const res = await buildAndSendTrx(
    'withdraw_domain_vault',
    [
      fcl.arg(hash, String),
      fcl.arg(key, String),
      fcl.arg(amount.toFixed(8), UFix64),
    ],
    { token },
  )
  return res
}

export const depositeDomainVault = async (hash, token, amount) => {
  const res = await buildAndSendTrx(
    'deposit_domain_vault',
    [fcl.arg(hash, String), fcl.arg(amount.toFixed(8), UFix64)],
    { token },
  )
  return res
}

export const transferNFT = async (type, id, to) => {
  console.log(type, id, to)
  const receiever = isFlowAddr(to)
    ? to
    : await queryDomainRecord(...to.split('.'))

  let scriptName = ''
  let args = []
  switch (type) {
    case 'Domains':
      const nameHash = await calcHash(...id.split('.'))

      scriptName = 'transfer_domain_with_hash_name'
      args = [fcl.arg(nameHash, String), fcl.arg(receiever, Address)]
  }
  console.log(args, scriptName)
  const res = await buildAndSendTrx(scriptName, args)
  return res
}

export const transferToken = async (token, amount, to) => {
  const receiever = isFlowAddr(to)
    ? to
    : await queryDomainRecord(...to.split('.'))

  const res = await buildAndSendTrx(
    'transfer_ft',
    [fcl.arg(receiever, Address), fcl.arg(amount.toFixed(8), UFix64)],
    { token },
  )
  return res
}

export const transferTokenWithSharedAccount = async (token, amount, to, userAddress, sharedAddress) => {
  const receiever = isFlowAddr(to)
    ? to
    : await queryDomainRecord(...to.split('.'))


    try {
      let trxScript = transactions['transfer_ft']
      console.log('trxScript ->', token, amount, to, userAddress, sharedAddress, trxScript)
      if (typeof trxScript == 'function') {
        trxScript = trxScript({token})
      }

      console.log('trxScript 222 ->', trxScript())

      const res = await sendTransaction(
        trxScript(),
        [fcl.arg(receiever, Address), fcl.arg(amount.toFixed(8), UFix64)],
        userAddress,
        sharedAddress
      )
      return res

    } catch (error) {
      console.log(error)
      return null
    }
}

export const initTokenVault = async (token) => {
  const res = await buildAndSendTrx('init_ft_token', [], { token })
  return res
}

export const changeDefault = async (oldName, newName) => {
  const oldNameHash = oldName.length > 0 ? namehash(oldName) : namehash('')
  const newNameHash = namehash(newName)
  const res = await buildAndSendTrx('change_default_domain_name', [
    fcl.arg(oldNameHash, String),
    fcl.arg(newNameHash, String),
  ])
  return res
}

export const removeDefault = async (name) => {
  const hash = namehash(name)
  const res = await buildAndSendTrx('remove_domain_text', [
    fcl.arg(hash, String),
    fcl.arg('isDefault', String),
  ])
  return res
}

// subdomain

export const createSubdomain = async (name) => {
  const nameArr = name.split('.')
  const hash = namehash(`${nameArr[1]}.${nameArr[2]}`)
  const subName = nameArr[0]
  const res = await buildAndSendTrx('mint_subdomain', [
    fcl.arg(hash, String),
    fcl.arg(subName, String),
  ])
  return res
}

export const setSubdomainText = async (namehash, subHash, key, obj) => {
  const res = await buildAndSendTrx('set_subdomain_text', [
    fcl.arg(namehash, String),
    fcl.arg(subHash, String),
    fcl.arg(key, String),
    fcl.arg(typeof obj == 'string' ? obj : JSON.stringify(obj), String),
  ])
  return res
}

export const removeSubdomainText = async (namehash, subHash, key) => {
  const res = await buildAndSendTrx('remove_subdomain_text', [
    fcl.arg(namehash, String),
    fcl.arg(subHash, String),
    fcl.arg(key, String),
  ])
  return res
}

export const setSubdomainAddress = async (
  hash,
  subHash,
  chainType,
  address,
) => {
  const res = await buildAndSendTrx('set_subdomain_address', [
    fcl.arg(hash, String),
    fcl.arg(subHash, String),
    fcl.arg(chainType, UInt64),
    fcl.arg(address, String),
  ])
  return res
}

export const removeSubdomainAddress = async (hash, subHash, chainType) => {
  const res = await buildAndSendTrx('remove_subdomain_address', [
    fcl.arg(hash, String),
    fcl.arg(subHash, String),
    fcl.arg(chainType, UInt64),
  ])
  return res
}

export const removeSubdomain = async (hash, subHash) => {
  const res = await buildAndSendTrx('remove_subdomain', [
    fcl.arg(hash, String),
    fcl.arg(subHash, String),
  ])
  return res
}

export const queryNFTs = async (address, limit, offset) => {
  const res = await axios.get(nftAPI, {
    params: { address, limit, offset },
    headers: {},
  })
  const { data } = res
  return data
}

export const readSharedAccounts = async (address) => {
  const docRef = doc(db, 'accounts', address)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) {
    console.log('Not exists')
    return {}
  }
  const data = docSnap.data()
  return data
}

export const readSharedAccount = async (address) => {
  const docRef = doc(db, 'shared_accounts', address)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) {
    console.log('Not exists')
    return {}
  }
  const data = docSnap.data()

  return data
}

export const readPendingTrx = async (address) => {
  const docRef = doc(db, 'pendingTransaction', address)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) {
    console.log('Not exists')
    return {}
  }
  const data = docSnap.data()

  return data
}

export const sendTransaction = async (cadence, args, userAddress, sharedAccountAddress) => {

  console.log('sendTransaction ->', cadence, args, userAddress, sharedAccountAddress)
  
  const createdTime = serverTimestamp()

  const formattedArg = args.map(item => item.xform.asArgument(item.value))
  console.log('args ->', args, formattedArg)

  const walletAddress = sharedAccountAddress 

  const currentUserKeyinSharedAccount = await readSharedAccount(sharedAccountAddress)

  console.log('currentUserKeyinSharedAccount ->', currentUserKeyinSharedAccount)

  const userKey = currentUserKeyinSharedAccount[userAddress][0]
  const walletKeyIndex = currentUserKeyinSharedAccount.accounts.indexOf(userAddress)

  console.log('userKey ->', userKey)
  console.log('walletKeyIndex ->', walletKeyIndex)
  const weight = userKey.weight
  const account = await fcl.send([fcl.getAccount(walletAddress)]).then(fcl.decode);
  const latestSealedBlock = await fcl.send([fcl.getBlock(true)]).then(fcl.decode);

  console.log('account =>', account, latestSealedBlock)

  const refBlock = latestSealedBlock.id
  const sequenceNum = account.keys[walletKeyIndex].sequenceNumber

  const tx = {
    cadence,
    refBlock,
    arguments: formattedArg,
    proposalKey: {
      address: walletAddress,
      keyId: walletKeyIndex,
      sequenceNum: sequenceNum
    },
    payer: sharedAccountAddress,
    payloadSigs: [],
    envelopeSigs: [],
    authorizers: [sharedAccountAddress],
    computeLimit: 9999,
  };
  const message = sdk.encodeTransactionEnvelope(tx);
  const signedTx = await signTx(tx, walletAddress, walletKeyIndex)
  const docRef = doc(db, 'pendingTransaction', sharedAccountAddress)
  await setDoc(docRef, {
    createdTime,
    signedAccount: [userAddress],
    signedWeight: weight,
    message,
    tx: signedTx
  })

  console.log('signedTx ==>', signedTx)

  if (weight > 1000) {
    await sendRawTransaction(tx)
  }
};

export const signTx = async (tx, walletAddress, walletKeyIndex) => {
  const message = sdk.encodeTransactionEnvelope(tx);
  const signature = await fcl.currentUser.signUserMessage(message);
  const userSigs = { 
    address: walletAddress, 
    keyId: walletKeyIndex, 
    sig: signature
  }
  tx.envelopeSigs.push(userSigs)
  return tx
}

export const sendRawTransaction = async (tx) => {

  console.log('sendRawTransaction ==>', tx)

  return await axios.post(
    `${process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE_REST}/v1/transactions`,
    {
      script: Buffer.from(tx.cadence).toString("base64"),
      arguments: tx.arguments.map((item) =>  Buffer.from(JSON.stringify(item)).toString("base64")),
      reference_block_id: tx.refBlock,
      gas_limit: String(tx.computeLimit),
      payer: tx.payer,
      proposal_key: {
        address: sansPrefix(tx.proposalKey.address),
        key_index: String(tx.proposalKey.keyId),
        sequence_number: String(tx.proposalKey.sequenceNum)
      },
      authorizers: tx.authorizers,
      payload_signatures: tx.payloadSigs.map((item) => {
        return {
          address: item.address,
          key_index: String(item.keyId),
          signature: Buffer.from(acct.signature, "hex").toString("base64")
        }
      }),
      envelope_signatures: tx.envelopeSigs.map((item) => {
        return {
          address: item.address,
          key_index: String(item.keyId),
          signature: Buffer.from(acct.signature, "hex").toString("base64")
        }
      }),
    }
  )
}