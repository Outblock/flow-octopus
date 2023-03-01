import React, { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import ReactGA from 'react-ga'
import { useRouter } from 'next/router'
import * as fcl from '@onflow/fcl'

import {
  Box,
  Flex,
  InputGroup,
  InputRightElement,
  Button,
  Center,
} from '@chakra-ui/react'

import * as Yup from 'yup'
import {
  SelectControl,
  NumberInputControl,
  SubmitButton,
  InputControl,
  CheckboxSingleControl,
  SwitchControl,
} from 'formik-chakra-ui'
import { Formik } from 'formik'
import Layout from '../../components/layouts/app'
import { gaCode } from '../../config/constants'
import accountStore from '../../stores/account'
import { useAccount } from 'api/query'
import { ellipseStr, isFlowAddr } from 'utils'

export default function Create() {
  const router = useRouter()
  const { user } = accountStore.useState('user')

  useEffect(() => {
    ReactGA.initialize(gaCode)
    ReactGA.pageview(window.location.pathname)
  }, [])

  const { data = {} } = useAccount(user.addr)
  const { keys = [], contracts } = data
  const [addtionKeys, setAddtionKeys] = useState([])

  const [cachhedKeys, setCachedKeys] = useState([])

  const validationSchema = Yup.object({
    creatorPubKey: Yup.string().required(),
    creatorWeight: Yup.number().required(),
    address: Yup.string().test(
      'validate address',
      'Invalid address',
      async (value = '', context) => {
        //todo suppoort domain
        return isFlowAddr(value)
      },
    ),
  })

  const initialValues = {
    creatorPubKey: '',
    address: '',
    creatorWeight: '',
    selectedKey: '',
    selectedWeight: '',
  }

  const onSubmit = async (values) => {}

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
                name={'creatorPubKey'}
                label={'Your publicKey'}
                // onChange={(e) => {
                //   setParticipantType(e.target.value)
                // }}
              >
                {keys.map((key, idx) => {
                  const { index, publicKey, hashAlgoString, signAlgoString } =
                    key
                  return (
                    <option key={idx} value={publicKey}>
                      {ellipseStr(publicKey)}
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
                  showStepper={false}
                  numberInputProps={{
                    placeholder: '123...',
                    min: 1,
                  }}
                />
              </InputRightElement>
            </InputGroup>
            {addtionKeys.length > 0 && (
              <>
                {addtionKeys.map((key, idx) => {
                  const { publicKey, index, weight } = key
                  return <>{publicKey}</>
                })}
              </>
            )}
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
                  const address = e.target.value
                  setCachedKeys([])
                  setFieldValue('address', address)
                  if (!isFlowAddr(address)) return
                  const account = await fcl.account(address)
                  const { keys = [] } = account
                  setCachedKeys(keys)
                }}
              />
              <InputGroup w="60%" size="md">
                <SelectControl
                  minH="100px"
                  w="70%"
                  name="selectedKey"
                  label={`PublicKey`}
                  // onChange={(e) => {
                  //   console.log(e)
                  // }}
                >
                  <option key={-1} value={''}>
                    Select PublicKey
                  </option>
                  {cachhedKeys.map((key, idx) => {
                    const {
                      publicKey,
                      hashAlgoString,
                      signAlgoString,
                      weight,
                    } = key
                    return (
                      <option key={idx} value={publicKey}>
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
                    showStepper={false}
                    max={1000}
                    min={1}
                    numberInputProps={{
                      placeholder: '123...',
                      min: 1,
                    }}
                  />
                </InputRightElement>
              </InputGroup>
              <Center h="100px">
                <Button
                  onClick={() => {
                    const { selectedKey, selectedWeight } = values
                    setAddtionKeys([
                      ...addtionKeys,
                      { publicKey: selectedKey, weight: selectedWeight },
                    ])
                  }}
                >
                  Add key
                </Button>
              </Center>
            </Flex>
          </Box>
        )}
      </Formik>
    )
  }

  return <Box>{renderForm()}</Box>
}

Create.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
