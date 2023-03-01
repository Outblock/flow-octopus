import React, { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import ReactGA from 'react-ga'
import { useRouter } from 'next/router'
import { FaUsers } from 'react-icons/fa'

import {
  Box,
  Text,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Center,
  Button,
  List,
  Icon,
} from '@chakra-ui/react'

import Layout from 'components/layouts/appBase'
import Empty from 'components/empty'

import { gaCode } from '../../config/constants'
import {
  useUserCollection,
  useNFTs,
  useSharedAccountInfo,
} from '../../api/query'
import accountStore from '../../stores/account'

import LoadingPanel from 'components/loadingPanel'
import UserAssets from 'components/userAssets'
import Trxs from 'components/trxs'
import { renderKey } from 'components/keys'

export default function Account() {
  const router = useRouter()
  const { t } = useTranslation()
  const { address = '' } = router.query

  const { user } = accountStore.useState('user')
  const isUser = user.addr === address
  const { data = {}, isLoading } = useUserCollection(address, false)
  const [tokenLoading, setTokenLoading] = useState(false)

  const {
    domains = [],
    flowBalance = 0,
    defaultDomain,
    bals = {},
    accountInfo = {},
  } = data

  let { keys = [] } = accountInfo

  const { data: accountData = {} } = useSharedAccountInfo(address)

  const { accounts = [] } = accountData
  const isSharedAccount = accounts.length > 0

  const {
    data: nftData = {},
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useNFTs(address) // TODO

  const { pages = [] } = nftData
  const hasData = pages[0] && !!pages[0].hasOwnProperty('nfts')

  // const vaultKeys = Object.keys(bals)

  useEffect(() => {
    ReactGA.initialize(gaCode)
    ReactGA.pageview(window.location.pathname)
  }, [])

  const handleInit = async (token) => {
    try {
      setTokenLoading(true)

      const res = await initTokenVault(token)

      const { status = 0 } = res
      if (status === 4) {
        toast({
          title: t('init.success'),
          status: 'success',
        })
        cb && cb()
      } else {
        toast({
          title: t('init.failed'),
          status: 'error',
        })
      }
    } catch (error) {
      setTokenLoading(false)
      toast({
        title: t('init.failed'),
        status: 'error',
      })
    }
    setTokenLoading(false)
  }

  const renderNFTsLoadingBtn = () => {
    return (
      <>
        {(hasData || hasNextPage) && (
          <Center m={4} w="100%">
            <Button
              disabled={!hasNextPage}
              variant="outline"
              isLoading={isFetching && hasData}
              onClick={() => {
                fetchNextPage()
              }}
            >
              {'Load more'}
            </Button>
          </Center>
        )}
      </>
    )
  }

  return (
    <>
      {isLoading ? (
        <LoadingPanel />
      ) : (
        <Box>
          <Box>
            <Flex align="center">
              {address} <Icon m={2} color="green" as={FaUsers} />
            </Flex>
            <Divider my={4} />
            <>
              {accounts.map((addr, idx) => {
                const accKeys = accountData[addr]
                return (
                  <>
                    {accKeys.map((key, i) => {
                      // const { hashAlgo, signAlgo, publicKey, index, wight } =
                      //   key
                      return renderKey(key)
                    })}
                  </>
                )
              })}
            </>
          </Box>
          <Tabs>
            <TabList>
              <Tab>{t('assets')}</Tab>
              <Tab>{t('transactions')}</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <UserAssets
                  bals={bals}
                  nftPages={pages}
                  renderNFTsLoadingBtn={renderNFTsLoadingBtn}
                />
              </TabPanel>
              <TabPanel>
                <Trxs datas={[]} />
              </TabPanel>
              {/* <TabPanel>
                <p>three!</p>
              </TabPanel> */}
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </>
  )
}

Account.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export const getStaticProps = async ({ locale }) => {
  try {
    const res = await serverSideTranslations(locale, ['common'])

    return {
      props: {
        ...res,
      },
    }
  } catch (error) {
    console.log(error)
    return {
      props: {},
    }
  }
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}
