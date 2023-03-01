import {
  useQuery,
  // useMutation,
  useInfiniteQuery,
} from 'react-query'
import * as fcl from '@onflow/fcl'

import { rootNames } from '../config/constants'
import domainStore from '../stores/domains'
import accountStore from '../stores/account'
import {
  queryRootDomains,
  queryRootVaultBalance,
  checkDomainCollection,
  queryFlowBalence,
  getUserDomainIds,
  getUserDomainsInfo,
  getDomainInfo,
  queryBals,
  queryGraffle,
  getDomainDeprecatedInfo,
  getUserDefaultDomain,
  queryNFTs,
  readSharedAccounts,
} from './index'
import { namehash } from '../utils/hash'

export * from './queryClient'

const ROOT_DOMAINS_QUERY = 'getRootDomains'
const FLOWNS_INFO_QUERY = 'getFlownsInfo'
const DOMAIN_HISTORY_QUERY = 'getDomainHistory'
const USER_COLLECTION_QUERY = 'getUserCollection'
const USER_ACCOUNT_QUERY = 'getUserAccount'
const GET_FLOW_NFTs = 'getFLOWNFTs'
const GET_SHARED_ACCOUNTS = 'getAccountLists'

export const getConnectedState = () => {
  const { appState = {} } = globalStore.useState('appState')
  const { connected = false } = appState
  return connected
}

// query root domains info
export const useRootDomains = () => {
  // const connect = getConnectedState();
  // if (!connect) return { data: {} };P:10
  const getRootDomains = async () => {
    const domains = await queryRootDomains()
    const domainMap = {}
    Object.keys(domains).map((id) => {
      domainMap[domains[id].name] = { ...domains[id] }
    })
    const reqs = rootNames.map((rootName) => {
      const rootId = domainMap[rootName].id
      // return buildAndExecScript('query_root_vault_balance', [fcl.arg(Number(rootId), UInt64)])
      return queryRootVaultBalance(rootId)
    })
    const vaultBals = await Promise.all(reqs)
    let balSum = 0
    let domainSum = 0
    rootNames.forEach((rootName, idx) => {
      const bal = parseFloat(vaultBals[idx])
      balSum += bal
      domainSum += Number(domainMap[rootName].domainCount)
      domainMap[rootName].vaultBalance = vaultBals[idx]
    })
    balSum = Number(balSum.toFixed(0))
    domainStore.setState({ rootDomains: domainMap, balSum, domainSum })
    return { domainMap }
  }

  return useQuery(ROOT_DOMAINS_QUERY, getRootDomains)
}

export const useUserCollection = (address = '', flag = true) => {
  const queryUserCollection = async () => {
    if (address == null || address.length === 0) {
      return { collectionIds: [], initState: false }
    }
    const initState = await checkDomainCollection(address)
    let collectionIds = []
    let domains = []
    let defaultDomain = null
    if (initState) {
      collectionIds = await getUserDomainIds(address)
      domains = await getUserDomainsInfo(address)
    }

    for (let i = 0; i < domains.length; i++) {
      let domain = domains[i]
      if (domain.deprecated) {
        // console.log(domain.nameHash, domain.id, '====')
        const deprecatedInfo = await getDomainDeprecatedInfo(
          domain.nameHash,
          domain.id,
        )
        if (deprecatedInfo) {
          domains[i] = {
            ...domain,
            ...deprecatedInfo,
            name: `${deprecatedInfo.name}.${deprecatedInfo.parentName}`,
          }
        }
      }
      const isDefault = domain.texts && domain.texts.isDefault
      if (isDefault) {
        defaultDomain = domain.name
      }
    }
    const flowBalance = await queryFlowBalence(address)
    const bals = await queryBals(address)
    const accountInfo = await fcl.account(address)

    if (flag) {
      accountStore.setState({
        domainIds: collectionIds,
        flowBalance,
        domains,
        tokenBals: bals,
        accountInfo,
      })
    }

    return {
      collectionIds,
      initState,
      flowBalance,
      domains,
      defaultDomain,
      accountInfo,
      bals,
    }
  }

  return useQuery(`${USER_COLLECTION_QUERY}-${address}`, queryUserCollection)
}

export const useDomainInfo = (domain = '') => {
  const hash = namehash(domain)

  const queryDomainInfo = async () => {
    try {
      if (domain.length === 0) {
        return { domainInfo: {} }
      }
      const domainInfo = await getDomainInfo(hash)
      const { owner } = domainInfo
      const defaultDomain = await getUserDefaultDomain(owner)
      return { domainInfo, defaultDomain }
    } catch (error) {
      console.log(error)
      return { domainInfo: null }
    }
  }

  return useQuery(`${FLOWNS_INFO_QUERY}-${hash}`, queryDomainInfo)
}

export const useDomainHistory = (hash = '') => {
  const queryDomainHistory = async () => {
    try {
      if (hash.length === 0) {
        return { history: [] }
      }
      const history = await queryGraffle({ nameHash: hash })
      return { history }
    } catch (error) {
      console.log(error)
      return { domainInfo: null }
    }
  }

  return useQuery(`${DOMAIN_HISTORY_QUERY}-${hash}`, queryDomainHistory)
}

export const useRegisterHistory = (parentName = '') => {
  const queryRegisterHistory = async () => {
    try {
      if (parentName.length === 0) {
        return { history: [] }
      }
      const history = await queryGraffle({ parentName })
      // console.log(history, parentName)
      return { history }
    } catch (error) {
      console.log(error)
      return { domainInfo: null }
    }
  }

  return useQuery(`${DOMAIN_HISTORY_QUERY}-${parentName}`, queryRegisterHistory)
}

export const useAccount = (address) => {
  const queryAccountInfo = async () => {
    try {
      const account = await fcl.account(address)
      // console.log(account)
      // console.log(history, parentName)
      return account
    } catch (error) {
      console.log(error)
      return {}
    }
  }

  return useQuery(`${USER_ACCOUNT_QUERY}-${address}`, queryAccountInfo)
}

export const useNFTs = (address, limit = 10) => {
  const query = async (config) => {
    try {
      if (address == null || address.length === 0) {
        return []
      }
      const { pageParam = 1 } = config
      const offset = (pageParam - 1) * limit
      const res = await queryNFTs(address, limit, offset)
      const { data = {} } = res
      const { nfts = [], nftCount = 0 } = data

      if (data && nfts.length > 0) {
        return {
          nfts: nfts,
          nextPage: pageParam + 1,
          totalPages: Math.ceil(nftCount / limit),
        }
      } else {
        return {}
      }
    } catch (error) {
      console.log(error)
      return {}
    }
  }

  return useInfiniteQuery(`${GET_FLOW_NFTs}`, query, {
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.nextPage <= lastPage.totalPages) return lastPage.nextPage
      return undefined
    },
  })
}

export const useSharedAccoounts = (address) => {
  const query = async () => {
    try {
      if (address == null || address.length === 0) {
        return {}
      }
      const res = await readSharedAccounts(address)

      console.log(res)

      return res
    } catch (error) {
      console.log(error)
      return {}
    }
  }

  return useQuery(`${GET_SHARED_ACCOUNTS}-${address}`, query)
}
