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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import * as fcl from '@onflow/fcl'

import { useTranslation } from 'next-i18next'
import { getFirestore } from 'firebase/firestore'
import { doc, setDoc } from 'firebase/firestore'
import { db } from 'utils'
import trxStore from 'stores/trx'

export default function Comp(props) {
  const { show, pendingTrx } = trxStore.useState('show', 'pendingTrx')
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const onClose = () => {
    trxStore.setState({ show: false, pendingTrx: {} })
  }

  const handleSign = async () => {}

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
          <ModalBody p={6}>{t('pending.trx')}</ModalBody>

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
