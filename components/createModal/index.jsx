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
import createModal from 'stores/createModal'
import { renderKey } from 'components/keys'
import { createAccount } from 'api/index'
import { getFirestore } from 'firebase/firestore'
import { doc, setDoc } from 'firebase/firestore'
import { db } from 'utils'
import { useRouter } from 'next/router'

export default function Comp(props) {
  const { keys, onClose = () => {} } = props
  const { show } = createModal.useState('show')
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  let weightSum = 0
  let isSingleWeight = false
  keys.map((k) => {
    const weight = Number(k.weight)
    if (weight >= 1000) {
      isSingleWeight = true
    }
    weightSum += weight
  })

  const writeToFirebase = async (trxId, txStatus, accounts) => {
    const filter = txStatus.events.filter(
      (event) => event.type === 'flow.AccountCreated',
    )
    const created_address = filter[0].data.address
    const tx = await fcl.send([fcl.getTransaction(trxId)]).then(fcl.decode)
    const obj = {
      id: trxId,
      address: created_address,
      accounts,
      transaction: tx,
      result: txStatus,
    }
    await setDoc(doc(db, 'accounts_creation', trxId), obj)
  }

  const handleCreate = async () => {
    try {
      setLoading(true)
      const accounts = []
      const pubKeys = []
      const signAlgos = []
      const hashAlgos = []
      const weights = []

      keys.map((key) => {
        const { publicKey, signAlgo, hashAlgo, weight, index, address } = key
        pubKeys.push(publicKey)
        signAlgos.push(signAlgo)
        hashAlgos.push(hashAlgo)
        weights.push(Number(weight).toFixed(2))
        accounts.push({
          address: address,
          index,
          publicKey,
          hashAlgo,
          signAlgo,
          weight: Number(weight),
        })
      })
      const { trxId, txStatus } = await createAccount(
        pubKeys,
        signAlgos,
        hashAlgos,
        weights,
      )
      await writeToFirebase(trxId, txStatus, accounts)
      setLoading(false)
      router.push('/account')

      onClose()
    } catch (e) {
      console.log(e)
      setLoading(false)
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
          <ModalHeader>{t('confirm.create')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <>
              {keys.map((key, i) => {
                const { isOwner = false, weight } = key
                return renderKey(key, {
                  disableAddressLink: true,
                  isOwner: isOwner,
                })
              })}
            </>
            {weightSum < 1000 && (
              <Alert
                status="error"
                borderRadius="10px"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="200px"
              >
                <AlertIcon boxSize="40px" />
                <AlertTitle>{t('weight.not.enough')}</AlertTitle>
                <AlertDescription>
                  {t('weight.not.enough.desc')}
                </AlertDescription>
              </Alert>
            )}
            {weightSum > 1000 && (
              <Alert
                status="warning"
                borderRadius="10px"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="100px"
                my={2}
              >
                <AlertIcon boxSize="20px" />
                <AlertTitle>{t('weight.exceed')}</AlertTitle>
                <AlertDescription>{t('weight.exceed.desc')}</AlertDescription>
              </Alert>
            )}

            {isSingleWeight && (
              <Alert
                status="warning"
                borderRadius="10px"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="100px"
                my={2}
              >
                <AlertIcon boxSize="20px" />
                <AlertTitle>{t('single.weight.warning')}</AlertTitle>
                <AlertDescription>
                  {t('single.weight.warning.desc')}
                </AlertDescription>
              </Alert>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              isDisabled={weightSum < 1000 || loading}
              isLoading={loading}
              onClick={() => {
                handleCreate()
              }}
            >
              {t('confirm')}
            </Button>
            <Button isDisabled={loading} onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
