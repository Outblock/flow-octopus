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
} from '@chakra-ui/react'
import * as fcl from '@onflow/fcl'

import { useTranslation } from 'next-i18next'
import { getFirestore } from 'firebase/firestore'
import { doc, setDoc } from 'firebase/firestore'
import { db } from 'utils'
import trxStore from 'stores/trx'
import accountStore from 'stores/account'
import { continueSignTx } from '../../api'

export default function Comp(props) {
  const { show, pendingTrx } = trxStore.useState('show', 'pendingTrx')
  const { user } = accountStore.useState('user')
  const currentAddr = user.addr
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const { createTime, signedAccount, tx } = pendingTrx

  // console.log(pendingTrx, '=====pendingTrx====')

  const onClose = () => {
    trxStore.setState({ show: false, pendingTrx: {} })
  }

  const handleSign = async () => {
    console.log('pendingTrx =>', pendingTrx)
    await continueSignTx(pendingTrx.tx.payer, currentAddr)
    trxStore.setState({ show: false, pendingTrx: {} })
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
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              isLoading={loading}
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
