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
    <Center cursor="pointer" maxW="240px">
      <Image
        src={logo}
        minW="35px"
        minH="35px"
        width="35px"
        height="35px"
        alt="Octopus"
        onClick={() => router.push('/')}
      />
      <Text ml={2}>Octopus</Text>
    </Center>
  )
}
export default Components
