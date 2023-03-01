import { Text, Flex, Box, Stack } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'

export default function Comp(props) {
  // const { t } = useTranslation()
  const { keys = [] } = props

  const renderKey = ({ publickey, index, weight }) => {
    return <Box></Box>
  }

  return (
    <Stack {...styles}>
      {keys.map((key, idx) => {
        const { publicKey, index, weight } = key
        return renderKey(publicKey, index, weight)
      })}
    </Stack>
  )
}
