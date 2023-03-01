/* eslint-disable  */
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import ReactGA from 'react-ga'
import { useRouter } from 'next/router'
import * as fcl from '@onflow/fcl'
import { MinusIcon } from '@chakra-ui/icons'
import { getFirestore } from 'firebase/firestore'
import { doc, setDoc } from 'firebase/firestore'

import {
  Box,
  Flex,
  InputGroup,
  InputRightElement,
  Button,
  IconButton,
  Center,
  Text,
  Divider,
  Spinner,
  Badge,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
} from '@chakra-ui/react'

import * as Yup from 'yup'
import {
  SelectControl,
  NumberInputControl,
  SubmitButton,
  InputControl,
} from 'formik-chakra-ui'
import { Formik } from 'formik'
import Layout from '../../components/layouts/app'
import { gaCode } from '../../config/constants'
import accountStore from '../../stores/account'
import { useAccount } from 'api/query'
import { ellipseStr, isFlowAddr, db } from 'utils'
import CreateModal from 'components/createModal'
import createModalStore from 'stores/createModal'
export default function Create() {
  const router = useRouter()
  const { user } = accountStore.useState('user')
  const { t } = useTranslation()

  useEffect(() => {
    ReactGA.initialize(gaCode)
    ReactGA.pageview(window.location.pathname)
  }, [])

  const { data = {} } = useAccount(user.addr)
  const { keys = [], contracts } = data
  const [addtionKeys, setAddtionKeys] = useState([])
  const [lodingKeys, setKeyLoding] = useState(false)
  const [loading, setLoading] = useState(false)

  const [cachhedKeys, setCachedKeys] = useState([])
  const [createKeys, setCreateKeys] = useState([])

  const validationSchema = Yup.object({
    creatorKeyStr: Yup.string().required('Required'),
    creatorWeight: Yup.number().integer().positive().required('Required'),
    selectedWeight: Yup.number().integer().positive(),
    address: Yup.string().test(
      'validate address',
      'Invalid address',
      async (value = '', context) => {
        //todo suppoort domain
        if (value == '') return true
        return isFlowAddr(value)
      },
    ),
  })

  const initialValues = {
    creatorKeyStr: '',
    address: '',
    creatorWeight: '',
    selectedKey: '',
    selectedWeight: '',
  }

  const labelStyles = {
    mt: '2',
    ml: '-2.5',
    fontSize: 'sm',
  }

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      const { creatorKeyStr, creatorWeight } = values
      const creatorKeyInfo = JSON.parse(creatorKeyStr)

      const keys = [
        {
          ...creatorKeyInfo,
          address: user.addr,
          weight: creatorWeight,
          isOwner: true,
        },
      ].concat(addtionKeys)
      console.log(keys, '======keys===')
      setCreateKeys(keys)
      createModalStore.setState({ show: true })

      // const { publicKey, hashAlgo, signAlgo, index } = creatorKeyInfo
      // const pubKeys = [publicKey]
      // const signAlgos = [signAlgo]
      // const hashAlgos = [hashAlgo]
      // const weights = [Number(creatorWeight).toFixed(2)]

      // const user = await fcl.currentUser.snapshot()
      // const addr = user.addr
      // const accounts = [
      //   {
      //     address: addr,
      //     index,
      //     publicKey,
      //     hashAlgo,
      //     signAlgo,
      //     weight: Number(creatorWeight),
      //   },
      // ]

      // addtionKeys.map((key) => {
      //   const { publicKey, signAlgo, hashAlgo, weight, index, address } = key
      //   pubKeys.push(publicKey)
      //   signAlgos.push(signAlgo)
      //   hashAlgos.push(hashAlgo)
      //   weights.push(Number(weight).toFixed(2))
      //   accounts.push({
      //     address: address,
      //     index,
      //     publicKey,
      //     hashAlgo,
      //     signAlgo,
      //     weight: Number(weight),
      //   })
      // })

      // console.log(pubKeys, signAlgos, hashAlgos, weights)
      // const { trxId, txStatus } = await createAccount(
      //   pubKeys,
      //   signAlgos,
      //   hashAlgos,
      //   weights,
      // )
      // await writeToFirebase(trxId, txStatus, accounts)

      // setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const renderForm = () => {
    return (
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={true}
      >
        {({ handleSubmit, values, errors, setFieldValue, validateForm }) => (
          <Box px={4} as="form" onSubmit={handleSubmit}>
            <InputGroup size="md">
              <SelectControl
                minH="100px"
                w="70%"
                name={'creatorKeyStr'}
                label={
                  <Flex mb={2} mr={4}>
                    <Text>{t('you.publickey')}</Text>
                  </Flex>
                }
                // onChange={(e) => {
                //   setParticipantType(e.target.value)
                // }}
              >
                <option key={-1} value={''}>
                  Select PublicKey
                </option>
                {keys.map((key, idx) => {
                  const {
                    index,
                    publicKey,
                    hashAlgoString,
                    signAlgoString,
                    hashAlgo,
                    signAlgo,
                  } = key
                  return (
                    <option key={idx} value={JSON.stringify(key)}>
                      {ellipseStr(publicKey)}
                      {` -- ${hashAlgoString} ${signAlgoString}`}
                    </option>
                  )
                })}
              </SelectControl>
              <InputRightElement h="100px" width="28%">
                <NumberInputControl
                  minH="100px"
                  name={'creatorWeight'}
                  label={'Weigth'}
                  max={1000}
                  min={1}
                  // showStepper={false}
                  numberInputProps={{
                    placeholder: '123...',
                    min: 1,
                    precision: 0,
                    step: 10,
                  }}
                />
              </InputRightElement>
            </InputGroup>
            <Slider
              flex="1"
              // step={50}
              colorScheme="blue"
              focusThumbOnChange={false}
              value={values.creatorWeight}
              max={1000}
              min={1}
              mb={4}
              onChange={(e) => {
                setFieldValue('creatorWeight', e)
              }}
            >
              <SliderMark value={250} {...labelStyles}>
                250
              </SliderMark>
              <SliderMark value={500} {...labelStyles}>
                500
              </SliderMark>
              <SliderMark value={750} {...labelStyles}>
                750
              </SliderMark>
              {/* <SliderMark
                value={values.creatorWeight}
                textAlign="center"
                bg="blue.500"
                color="white"
                mt="-10"
                ml="-5"
                w="12"
              >
                {values.creatorWeight}
              </SliderMark> */}
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              
              <SliderThumb
                fontSize="sm"
                boxSize="32px"
                // eslint-disable-next-line react/no-children-prop
                children={values.creatorWeight}
              />
            </Slider>

            {addtionKeys.length > 0 && (
              <>
                {addtionKeys.map((key, idx) => {
                  const {
                    publicKey,
                    index,
                    weight,
                    address,
                    hashAlgoString,
                    signAlgoString,
                  } = key
                  return (
                    <Flex key={idx} justify="space-between" align="center">
                      <Flex w="60%">
                        {ellipseStr(publicKey, 8)}
                        {` ${address}`}
                      </Flex>
                      <Box w="20%" px={2}>
                        <Badge
                          size="sm"
                          variant="subtle"
                          borderRadius="full"
                          colorScheme="green"
                          px={2}
                        >
                          {hashAlgoString}
                        </Badge>
                        <Badge
                          variant="subtle"
                          borderRadius="full"
                          colorScheme="teal"
                          px={2}
                        >
                          {signAlgoString}
                        </Badge>
                      </Box>
                      <Flex
                        px={4}
                        w="30%"
                        justify="space-between"
                        align="center"
                      >
                        <Text>{weight}</Text>
                        <IconButton
                          variant="outline"
                          colorScheme="red"
                          aria-label="Call Segun"
                          size="sm"
                          icon={<MinusIcon />}
                          onClick={() => {
                            console.log('del')
                            let arr = addtionKeys.filter((k) => {
                              return k.publicKey != publicKey
                            })
                            setAddtionKeys(arr)
                          }}
                        />
                      </Flex>
                    </Flex>
                  )
                })}
              </>
            )}

            <Divider my={4} />
            <Flex align="center" justify="space-between">
              <InputControl
                minH="100px"
                w="30%"
                name={'address'}
                label={'Address'}
                inputProps={{
                  placeholder: 'eg.0xxxx',
                }}
                onChange={async (e) => {
                  try {
                    const address = e.target.value
                    setCachedKeys([])
                    setFieldValue('address', address)
                    if (!isFlowAddr(address)) return
                    setKeyLoding(true)
                    const account = await fcl.account(address)
                    const { keys = [] } = account
                    setCachedKeys(keys)
                    setKeyLoding(false)
                  } catch (error) {
                    console.log(error)
                    setKeyLoding(false)
                  }
                }}
              />
              <InputGroup w="60%" size="md" ml={4}>
                <SelectControl
                  minH="100px"
                  w="70%"
                  name="selectedKey"
                  label={
                    <Box mb={2} mr={4}>
                      {'PublicKey'}
                      {lodingKeys && <Spinner ml={2} size="sm" />}
                    </Box>
                  }
                >
                  <option key={-1} value={''}>
                    Select PublicKey
                  </option>
                  {cachhedKeys.map((key, idx) => {
                    const { publicKey } = key
                    return (
                      <option key={idx} value={JSON.stringify(key)}>
                        {ellipseStr(publicKey)}
                      </option>
                    )
                  })}
                </SelectControl>
                <InputRightElement h="100px" width="28%">
                  <NumberInputControl
                    minH="100px"
                    name={'selectedWeight'}
                    label={'Weigth'}
                    // showStepper={false}
                    max={1000}
                    min={1}
                    numberInputProps={{
                      placeholder: '123...',
                      min: 1,
                      precision: 0,
                    }}
                  />
                </InputRightElement>
              </InputGroup>
              <Center h="100px">
                <Button
                  mx={2}
                  onClick={() => {
                    const { selectedKey, selectedWeight, address } = values
                    const selectKeyInfo = JSON.parse(selectedKey)
                    if (!selectedKey || !selectedWeight) return
                    const {
                      publicKey,
                      signAlgoString,
                      hashAlgoString,
                      signAlgo,
                      hashAlgo,
                      index,
                    } = selectKeyInfo
                    let existKey = false
                    let existAddr = false
                    addtionKeys.map((k) => {
                      if (
                        k.publicKey == publicKey ||
                        values.creatorKeyStr.indexOf(k.publicKey) >= 0
                      ) {
                        existKey = true
                      }

                      if (k.address == address || k.address == user.addr) {
                        existAddr = true
                      }
                    })
                    if (existKey) {
                      console.log('key existd')
                      return
                    }

                    if (existAddr) {
                      console.log('addr exit')
                    }

                    setAddtionKeys([
                      ...addtionKeys,
                      {
                        publicKey: publicKey,
                        signAlgoString,
                        hashAlgoString,
                        signAlgo,
                        hashAlgo,
                        weight: selectedWeight,
                        address: values.address,
                        index,
                        isOwner: values.address == user.addr,
                      },
                    ])
                  }}
                >
                  Add key
                </Button>
              </Center>
            </Flex>
            <Slider
              flex="1"
              mb={4}
              // step={50}
              focusThumbOnChange={false}
              value={values.selectedWeight}
              colorScheme="green"
              max={1000}
              min={1}
              onChange={(e) => {
                setFieldValue('selectedWeight', e)
              }}
            >
              <SliderMark value={250} {...labelStyles}>
                250
              </SliderMark>
              <SliderMark value={500} {...labelStyles}>
                500
              </SliderMark>
              <SliderMark value={750} {...labelStyles}>
                750
              </SliderMark>
              {/* <SliderMark
                value={values.creatorWeight}
                textAlign="center"
                bg="blue.500"
                color="white"
                mt="-10"
                ml="-5"
                w="12"
              >
                {values.creatorWeight}
              </SliderMark> */}
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb
                fontSize="sm"
                boxSize="32px"
                // eslint-disable-next-line react/no-children-prop
                children={values.selectedWeight}
              />
            </Slider>

            <SubmitButton
              isLoading={loading}
              disabled={Object.keys(errors).length || addtionKeys.length == 0}
            >
              Create
            </SubmitButton>
          </Box>
        )}
      </Formik>
    )
  }

  return (
    <Box>
      {renderForm()}
      <CreateModal
        keys={createKeys}
        onClose={() => {
          createModalStore.setState({ show: false })
          setLoading(false)
        }}
      />
    </Box>
  )
}

Create.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
