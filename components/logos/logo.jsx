import React from 'react'
import Image from 'next/image'
import { Center, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useColorMode } from '@chakra-ui/react'

const Components = ({ children }) => {
  const { colorMode } = useColorMode()
  const router = useRouter()

  const logo = '/assets/logo.svg'
  return (
    <Center cursor="pointer" maxW="220px">
      <Image
        src={logo}
        width="35px"
        height="35px"
        alt="Octopus"
        onClick={() => router.push('/')}
      />
      <Text ml={2}>Octous</Text>
    </Center>
  )
}
export default Components
