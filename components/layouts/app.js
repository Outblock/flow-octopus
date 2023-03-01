import Head from 'next/head'
import { useState } from 'react'
import {
  Container,
  Divider,
  Center,
  Box,
  Button,
  useMediaQuery,
  useColorMode,
  useTheme,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import Spinner from 'react-cli-spinners'

import { fclinit } from '../../utils'
import Header from '../../components/header'
import LoadingPanel from '../loadingPanel'
import accountStore from '../../stores/account'
import { useUserCollection } from '../../api/query'
import { initDomainCollection } from '../../api'
import { toast } from '../../utils'

export default function Layout({ children }) {
  fclinit()
  const { t } = useTranslation()
  const router = useRouter()
  const { pathname } = router

  // const path = pathname.slice(1)
  const [isPC = true] = useMediaQuery('(min-width: 48em)')
  const { colorMode } = useColorMode()
  const theme = useTheme()
  const primary =
    colorMode === 'light' ? theme.colors.lightPrimary : theme.colors.primary
  const { user = {} } = accountStore.useState('user')
  const { addr = '' } = user

  const {
    data = {},
    refetch,
    isLoading: fetchLoading,
  } = useUserCollection(addr)

  const [loading, setLoading] = useState(false)

  const handleInit = async () => {
    setLoading(true)
    const res = await initDomainCollection()
    if (res == null) {
      refetch()
    } else {
      refetch()
      const { status = 0 } = res
      if (status === 4) {
        toast({
          title: t('init.success'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
    }
    setLoading(false)
  }

  const renderConnectPanel = () => {
    return <Center>{t('connect.tip')}</Center>
  }

  const renderChildren = () => {
    // console.log(initState)
    return <Box>{children}</Box>
  }

  return (
    <>
      <Head>
        <title>Flow octopus</title>
      </Head>
      <main>
        <Container px={['5%', '15%']} w="100%" h="100%" maxW="1440px">
          <Header />

          <Box py={[5, 5, 10]} pr={18}></Box>
          {addr ? renderChildren() : renderConnectPanel()}
        </Container>
      </main>
    </>
  )
}
