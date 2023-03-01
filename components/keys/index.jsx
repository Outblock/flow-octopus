import { Text, Flex, Box, Stack, Badge, Link } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { ellipseStr, raw2SigStr, raw2HashStr } from 'utils'

export const renderKey = (
  {
    publicKey,
    index,
    weight,
    hashAlgoString,
    signAlgoString,
    revoked,
    signAlgo,
    hashAlgo,
    address = '',
  },
  opt = {},
) => {
  const { disableAddressLink = false, isOwner = false } = opt
  return (
    <Flex w="100%" align="center" justify="space-between" my={2}>
      <Box w="50%">
        {ellipseStr(publicKey, 8)}
        <Badge mx={2} colorScheme="blue">
          {hashAlgoString || raw2HashStr(hashAlgo)}
        </Badge>
        <Badge colorScheme="green">
          {signAlgoString || raw2SigStr(signAlgo)}
        </Badge>
        {revoked ? <Badge colorScheme="red">{'revoked'}</Badge> : <></>}
      </Box>
      <Box w="25%">
        {address ? (
          disableAddressLink ? (
            <Text>{isOwner ? 'You' : address}</Text>
          ) : (
            <Link
              fontStyle="italic"
              textDecoration="underline"
              href={`/account/${address}`}
            >
              {address}
            </Link>
          )
        ) : (
          <>Index: {index}</>
        )}
      </Box>
      <Box w="15%">Weight: {weight}</Box>
    </Flex>
  )
}

export default function Comp(props) {
  // const { t } = useTranslation()
  const { keys = [], styles = {}, ...rest } = props

  return (
    <Stack {...styles} {...rest}>
      {keys.map((key, idx) => {
        return renderKey(key)
      })}
    </Stack>
  )
}
