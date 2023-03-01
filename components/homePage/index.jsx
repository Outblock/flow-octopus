import React, { useEffect, useState } from 'react'
import {
  Divider,
  Stack,
  Box,
  Text,
  Flex,
  useColorMode,
  useMediaQuery,
  Button,
  Center,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'

const Component = ({ children }) => {
  const { t } = useTranslation('common')
  const { colorMode } = useColorMode()
  const [isPC = true] = useMediaQuery('(min-width: 48em)')
  const router = useRouter()
  const gradientBg = 'linear-gradient(270deg, #0B6623 7.86%, #21D27D 100%)'

  return (
    <>
      <Stack
        direction={['column', 'column', 'row']}
        h={['100%', '100%', 'calc(100vh - 400px)']}
      >
        <Box
          h={['520px', '520px', '100%']}
          pt={[4, 4, 10]}
          w={['100%', '100%', '100%']}
        >
          <Text h="108px" textStyle="h1" bgGradient={gradientBg} bgClip="text">
            {t('title')}
            <span id="title"></span>
          </Text>
          <Text mt={2} h={['94px', '94px', '128px']} textStyle="desc">
            {t('title.desc')}
          </Text>
        </Box>
        <Center w="100%">
          <Flex px={4} w="100%" align="center" justify="space-between">
            <Button
              w="160px"
              borderRadius="full"
              colorScheme="teal"
              onClick={() => router.push('/account')}
            >
              {t('my.account')}
            </Button>
            <Button
              w="160px"
              borderRadius="full"
              colorScheme="green"
              onClick={() => router.push('/create')}
            >
              {t('create.account')}
            </Button>
          </Flex>
        </Center>

        <Divider
          w="1px"
          height="100%"
          orientation="vertical"
          border="1px solid"
          opacity="0.12"
        />
      </Stack>
    </>
  )
}
export default Component
