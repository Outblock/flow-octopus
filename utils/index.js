import { createStandaloneToast } from '@chakra-ui/react'
import moment from 'moment'
import Big from 'big.js'
import axios from 'axios'
import * as fcl from '@onflow/fcl'
import { normalize, chineseReg } from './hash'
import { send as httpSend } from '@onflow/transport-http'
import { send as grpcSend } from '@onflow/transport-grpc'
import { init } from '@onflow/fcl-wc'
import firebase from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'

import {
  nodeUrl,
  flownsAddr,
  flownsDomainAddr,
  flowTokenAddr,
  flowFungibleAddr,
  fusdTokenAddr,
  flowNonFungibleAddr,
  alchemyKey,
  discoveryUrl,
  network,
  discoveryEndpointUrl,
  rpcType,
  flowscanKey,
  flowscanUrl,
} from '../config/constants'
import { emojis } from './emojis'
import emojiRegex from 'emoji-regex'

export const fclinit = () => {
  fcl
    .config()
    .put('discovery.wallet', discoveryUrl)
    .put('discovery.authn.endpoint', discoveryEndpointUrl)
    .put('sdk.transport', rpcType == 'REST' ? httpSend : grpcSend)
    .put('env', network)
    .put('flow.network', network)
    .put('accessNode.api', nodeUrl)
    .put('0xDomains', flownsDomainAddr)
    .put('0xFlowns', flownsAddr)
    .put('0xNonFungibleToken', flowNonFungibleAddr)
    .put('0xFungibleToken', flowFungibleAddr)
    .put('0xFlowToken', flowTokenAddr)
    .put('0xFUSD', fusdTokenAddr)
    // .put('grpc.metadata', { api_key: alchemyKey })
    .put('app.detail.title', 'Octopus')
    .put(
      'app.detail.icon',
      'https://trello.com/1/cards/63fe15a5a214144acf5f0dc7/attachments/63fe15b269866469f0adc349/previews/63fe15b269866469f0adc3bd/download/Component_8_%283%29.png',
    )

  initWalletConnect()
  // console.log('initWalletConnect')
}

export const initWalletConnect = async () => {
  // console.log(
  //   fcl.pluginRegistry.getPlugins().get('fcl-plugin-service-walletconnect'),
  //   fcl.pluginRegistry.getPlugins(),
  // )
  if (
    typeof window !== 'undefined' &&
    !fcl.pluginRegistry.getPlugins().get('fcl-plugin-service-walletconnect')
  ) {
    const DEFAULT_APP_METADATA = {
      name: 'Render',
      description: 'Render your Flowns domains with NFT',
      url: window.location.origin,
      icons: [''],
    }
    const { FclWcServicePlugin, client } = await init({
      projectId: 'f23410f1abd6f028843e6b53306eb05d', // required
      metadata: DEFAULT_APP_METADATA, // optional
      includeBaseWC: true, // optional, default: false
      // wcRequestHook: (wcRequestData) => {
      // optional,default: null
      // handlePendingRequest(data)
      // },
      // pairingModalOverride: (uri, rejectPairingRequest) => {
      // optional,default: null
      // handlePendingPairingRequest(data)
      // },
    })

    fcl.pluginRegistry.add(FclWcServicePlugin)
  }
}

export const getNowTimestamp = () => {
  return new Date().getTime()
}

export const timeformater = (timestamp, formater) => {
  const time = Number(timestamp)
  if (time === 0) return ''
  return moment(time * 1000).format(formater || 'YYYY-MM-DD hh:mm:ss')
}

export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const formatBalance = (amount = '0', decimal = 18) => {
  const num = Big(amount).div(10 ** decimal)
  return num.toFixed(2)
}

export const postQuery = async (queryObj) => {
  try {
    const url = `${flowscanUrl}?token=${flowscanKey}`
    const res = await axios.post(url, queryObj)
    const { data } = res
    return data.data
  } catch (error) {
    console.log(error)
    return {}
  }
}

export const getQuery = async (url, params = {}, headers = {}) => {
  try {
    const data = await axios.get(url, { params, headers })
    return data.data
  } catch (error) {
    console.log(error)
    return {}
  }
}

export const putReq = async (url, params = {}, headers = {}) => {
  try {
    const data = await axios.put(url, params, { headers })
    return data.data
  } catch (error) {
    console.log(error)
    return {}
  }
}

export const postReq = async (url, params = {}, headers = {}) => {
  try {
    const data = await axios.post(url, params, { headers })
    return data.data
  } catch (error) {
    console.log(error)
    return {}
  }
}

const toastStandalone = createStandaloneToast()
export const toast = ({
  title = '',
  desc = '',
  status = 'success',
  duration = 3000,
  isClosable = true,
  position = 'top',
}) => {
  toastStandalone({
    position: position,
    title,
    description: desc,
    status,
    duration,
    isClosable,
  })
}

export const alert = (msg, title = 'Error') => {
  toast({
    title: title,
    status: 'warning',
    duration: 2000,
    isClosable: true,
    desc: msg,
  })
}

export function getFlowScanLink(chainType, data, type) {
  const host = chainType === 'mainnet' ? `https://flowscan.io` : ``

  switch (type) {
    case 'transaction': {
      return `${host}/tx/${data}`
    }
    case 'token': {
      return `${host}/token/${data}`
    }
    case 'block': {
      return `${host}/block/${data}`
    }
    case 'address':
    default: {
      return `${host}/address/${data}`
    }
  }
}

export const preloadFonts = (id) => {
  return new Promise((resolve) => {
    WebFont.load({
      typekit: {
        id: id,
      },
      active: resolve,
    })
  })
}

export const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min)

export const sendTrx = async (CODE, args, limit = 9999) => {
  const txId = await fcl
    .send([
      fcl.transaction(CODE),
      fcl.args(args),
      fcl.proposer(fcl.authz),
      fcl.payer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(limit),
    ])
    .then(fcl.decode)

  return txId
}

export const throttle = (fn, delay) => {
  let previous = 0
  // ????????????????????????????????????????????????????????????????????? previous
  return function () {
    var _this = this
    var args = arguments
    var now = new Date()
    if (now - previous > delay) {
      fn.apply(_this, args)
      previous = now
    }
  }
}

export const debounce = (func, wait) => {
  let timer
  return function () {
    var context = this // ?????? this ??????
    var args = arguments // arguments ????????? event

    if (timer) clearTimeout(timer)

    timer = setTimeout(function () {
      func.apply(context, args)
    }, wait)
  }
}

export const execScript = async (script, args = []) => {
  return await fcl
    .send([fcl.script`${script}`, fcl.args(args)])
    .then(fcl.decode)
}

export const camelize = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toUpperCase() : word.toUpperCase()
    })
    .replace(/\s+/g, '')
}

export const ellipseAddress = (address = '', width = 3) => {
  return `${address.slice(0, width)}...${address.slice(-width)}`
}

export const ellipseStr = (str = '', start = 8, end = 8) => {
  return `${str.slice(0, start)}...${str.slice(-end)}`
}

export const validateDomain = (name = '') => {
  try {
    if (name.length == 0) {
      return false
    }
    if (name.indexOf('_') > 1 && name.indexOf('_') !== name.length - 1) {
      return true
    }
    normalize(name)

    return true
  } catch (error) {
    return false
  }
}

export const isFlowAddr = (str = '') => {
  return /^0x[0-9a-f]{16}$/.test(str)
}

export const firstUpperCase = (value) => {
  return value.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
    return $1.toUpperCase() + $2.toLowerCase()
  })
}

export const validateKey = (key) => {
  const reg = /^[_a-zA-Z][_a-zA-Z0-9]*$/
  return reg.test(key)
}

export const validateAddress = (key, address = '') => {
  if (key == undefined || Number(key) > 1) return false
  address = address.toLowerCase()
  const flowReg = /^0x[0-9a-f]{16}$/
  const ethReg = /^0x[0-9a-f]{40}$/
  let reg = null
  key = Number(key)
  switch (key) {
    case 0:
      reg = flowReg
      break
    case 1:
      reg = ethReg
      break
    default:
      return false
  }
  return reg.test(address)
}

export const validateUrl = (vaule) => {
  return /^https?:\/\/.+/.test(vaule)
}

export const validateEmail = (vaule) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(vaule)
}

export const containEmoji = (value) => {
  const regex = emojiRegex()
  return regex.test(value)
}

export const validateEmoji = (value) => {
  const flag = containEmoji(value)
  const regex = emojiRegex()

  if (flag) {
    const emojiArr = [...value.matchAll(regex)]
    const invalid = emojiArr.filter((match) => {
      return emojis.indexOf(match[0]) == -1
    })
    return invalid.length == 0
  } else {
    return true
  }
}

export const conpareKeys = (a = {}, b = {}) => {
  let aKeys = Object.keys(a)
  let bKeys = Object.keys(b)
  if (aKeys.length == 0 && bKeys.length == 0) {
    return null
  }

  let key = []
  aKeys.map((k) => {
    if (bKeys.indexOf(k) < 0) {
      key.push(k)
    }
  })

  bKeys.map((k) => {
    if (aKeys.indexOf(k) < 0 && key.indexOf(k) < 0) {
      key.push(k)
    }
  })

  return key
}

export const hashAlgoEnum = [
  '',
  'SHA2_256',
  'SHA2_384',
  'SHA3_256',
  'SHA3_384',
  'KMAC128_BLS_BLS12_381',
  'KECCAK_256',
]

export const sigAlgoEnum = [
  '',
  'ECDSA_P256',
  'ECDSA_secp256k1',
  'BLS_BLS12_381',
]

export const algos2Raw = (algoStr) => {
  return sigAlgoEnum.indexOf(algoStr)
}

export const hashAlgo2Raw = (hashStr) => {
  return hashAlgoEnum.indexOf(hashStr)
}

export const raw2SigStr = (code) => {
  return sigAlgoEnum[code]
}

export const raw2HashStr = (code) => {
  return hashAlgoEnum[code]
}

const firebaseConfig = {
  apiKey: 'AIzaSyDAd4nmAJWS3ykeD79YD6HRSUdybp33nE4',
  authDomain: 'flow-octopus.firebaseapp.com',
  projectId: 'flow-octopus',
  storageBucket: 'flow-octopus.appspot.com',
  messagingSenderId: '339748207073',
  appId: '1:339748207073:web:0dbb0d758fb8690b2d3aa0',
}

const firebaseApp = initializeApp(firebaseConfig)
export const app = firebaseApp
export const db = getFirestore(app)
