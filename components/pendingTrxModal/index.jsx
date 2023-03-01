import { useState } from 'react'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Box,
} from '@chakra-ui/react'

import * as fcl from '@onflow/fcl'
import dynamic from 'next/dynamic'

import { useTranslation } from 'next-i18next'
import { getFirestore } from 'firebase/firestore'
import { doc, setDoc } from 'firebase/firestore'
import { db, timeformater, toast } from 'utils'
import trxStore from 'stores/trx'
import accountStore from 'stores/account'
import { continueSignTx } from '../../api'
const BrowserReactJsonView = dynamic(() => import('react-json-view'), {
  ssr: false,
})

export default function Comp(props) {
  const { show, pendingTrx } = trxStore.useState('show', 'pendingTrx')
  const { user } = accountStore.useState('user')
  const currentAddr = user.addr
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const { createdTime = {}, signedAccount = {}, tx = {} } = pendingTrx
  const { seconds = 0 } = createdTime

  const signedAddrs = Object.keys(signedAccount)

  const { arguments: args, cadence } = tx
  // console.log(pendingTrx, '=====pendingTrx====')

  const onClose = () => {
    trxStore.setState({ show: false, pendingTrx: {} })
  }

  const handleSign = async () => {
    try {
      setLoading(true)
      console.log('pendingTrx =>', pendingTrx)
      const res = await continueSignTx(pendingTrx.tx.payer, currentAddr)
      console.log(res, '=====')
      if (res == true) {
        toast({
          title: t(`sign.transfer.success`),
          status: 'success',
        })
      } else {
        toast({
          title: t(`sign.transfer.failed`),
          status: 'success',
        })
      }
      trxStore.setState({ show: false, pendingTrx: {} })
    } catch (e) {
      console.log(e)
      toast({
        title: t(`sign.transfer.failed`),
        status: 'success',
      })
    }
  }

  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={show}
        onClose={onClose}
        size="4xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('pending.trx')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <Text></Text>
            <Box>
              {t('created.time')} {timeformater(seconds)}
            </Box>
            <Box
              h="40vh"
              overflow="scroll"
              border="1px solid rgba(0, 0, 0, 0.08)"
              borderRadius="10px"
              p={4}
            >
              <BrowserReactJsonView
                indentWidth={2}
                collapseStringsAfterLength={40}
                theme={'rjv-default'}
                src={tx}
                name={null}
                displayDataTypes={false}
                style={{
                  'background-color': 'transparent',
                  width: '450px',
                  overflow: 'scroll',
                }}
              />
            </Box>
            <Box my={2}>Signed Account: </Box>
            {signedAddrs.map((addr, idx) => {
              const account = signedAccount[addr]
              const { signedWeight, signedTime = {} } = account
              const { seconds } = signedTime
              return (
                <Text key={idx}>
                  {addr == currentAddr ? 'You' : addr} {t('signed')} {t('at')}{' '}
                  <Text as="span" fontWeight={300} fontStyle="italic">
                    {timeformater(seconds)}{' '}
                  </Text>
                  {t('by')}
                  <Text as="span" fontWeight={600}>
                    {' '}
                    {signedWeight}{' '}
                  </Text>
                </Text>
              )
            })}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              isLoading={loading}
              isDisabled={signedAddrs.indexOf(currentAddr) >= 0}
              onClick={() => {
                handleSign()
              }}
            >
              {t('confirm')}
            </Button>
            <Button isDisabled={loading} onClick={onClose}>
              {t('cancel')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
