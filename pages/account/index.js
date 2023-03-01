import React, { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import ReactGA from 'react-ga'
import { useRouter } from 'next/router'
import {
  Box,
  Text,
  Divider,
  Flex,
  Badge,
  Kbd,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
} from '@chakra-ui/react'
import { MdOutlinePending } from 'react-icons/md'

import Layout from 'components/layouts/app'
import LoadingPanel from 'components/loadingPanel'
import Keys from 'components/keys'
import Empty from 'components/empty'
import { ellipseStr } from 'utils'

import { gaCode } from '../../config/constants'
import accountStore from '../../stores/account'
import { useSharedAccoounts } from 'api/query'
import trxStore from 'stores/trx'

export default function Account() {
  const router = useRouter()
  const { user, accountInfo = {} } = accountStore.useState(
    'user',
    'accountInfo',
  )
  const { t } = useTranslation()

  useEffect(() => {
    ReactGA.initialize(gaCode)
    ReactGA.pageview(window.location.pathname)
  }, [])

  const { keys = [] } = accountInfo
  const currentAddr = user.addr
  // useEffect(() => {
  //   if (user.addr) {
  //     router.push(`/account/${user.addr}`)
  //   }
  // }, [user, router])
  const { data = {}, isLoading } = useSharedAccoounts(user.addr)
  const { sharedAccount = [] } = data

  return (
    <Box>
      <Text
        fontStyle="italic"
        textDecoration="underline"
        cursor="pointer"
        onClick={() => router.push(`/account/${user.addr}`)}
      >
        {user.addr}
      </Text>
      <Keys keys={keys} m={4} />
      <Divider my={4} />
      <Text mb={4} textStyle="h1">
        {t('shared.accounts')}
      </Text>
      {isLoading ? (
        <LoadingPanel />
      ) : (
        <>
          {sharedAccount.length > 0 ? (
            <Accordion>
              {sharedAccount.map((addr, idx) => {
                const accountInfo = data[addr]
                const { pendingTrx } = accountInfo
                const hasPending = pendingTrx && pendingTrx.tx
                let keys = Object.keys(accountInfo)
                keys = keys.splice(0, keys.length - 3)
                return (
                  <AccordionItem key={idx}>
                    <AccordionButton>
                      <Flex
                        flex={1}
                        textAlign="left"
                        align="center"
                        justify="space-between"
                      >
                        <Text
                          fontStyle="italic"
                          textDecoration="underline"
                          cursor="pointer"
                          onClick={() => router.push(`/account/${addr}`)}
                        >
                          {addr}
                        </Text>
                        {hasPending && (
                          <Flex mx={8} align="center" justify="space-between">
                            <IconButton
                              colorScheme="teal"
                              size="sm"
                              icon={<MdOutlinePending />}
                              onClick={() =>
                                trxStore.setState({ show: true, pendingTrx })
                              }
                            />
                            <Text ml={2}>{t('pending.trx')}</Text>
                          </Flex>
                        )}
                      </Flex>
                      <AccordionIcon />
                    </AccordionButton>

                    <AccordionPanel pb={4}>
                      {keys.map((key, idx) => {
                        const { publicKey, index, weight } = accountInfo[key]
                        return (
                          <Flex
                            w="100%"
                            key={idx}
                            justify="space-between"
                            align="center"
                          >
                            <Text>{ellipseStr(publicKey, 10)}</Text>
                            <Kbd>index: {index}</Kbd>
                            <Badge colorScheme="green">Weight: {weight}</Badge>
                          </Flex>
                        )
                      })}
                    </AccordionPanel>
                  </AccordionItem>
                )
              })}
            </Accordion>
          ) : (
            <Empty h="50vh" tip={`Empty`} />
          )}
        </>
      )}
    </Box>
  )
}

Account.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
