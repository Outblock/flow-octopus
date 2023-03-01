import {
  Text,
  Flex,
  Box,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Button,
} from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { useTrxs } from 'api/query'
import { timeformater, ellipseStr } from 'utils'
import moment from 'moment'
import { t } from '@onflow/fcl'

export default function Comp(props) {
  const { t } = useTranslation()
  const { address } = props

  const {
    data = { pages: [] },
    isFetching,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
  } = useTrxs(address)
  let { pages = [] } = data

  console.log(pages, '-======')

  const hasData = pages[0] && !!pages[0].hasOwnProperty('trxs')
  const nextCursor = pages.length > 0 ? pages[pages.length - 1].nextPage : ''
  const hasNextPage =
    pages.length > 0 ? pages[pages.length - 1].totalPages : false

  return (
    <TableContainer>
      <Table variant="striped" colorScheme="teal">
        <TableCaption>
          <Button
            disabled={!hasNextPage}
            variant="outline"
            isLoading={isFetching && hasData}
            onClick={() => {
              fetchNextPage({ pageParam: nextCursor })
            }}
          >
            {'Load more'}
          </Button>
        </TableCaption>
        <Thead>
          <Tr>
            <Th>{t('time')}</Th>
            <Th>{t('hash')}</Th>
            <Th>{t('status')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {pages.map((page, idx) => {
            return page.trxs.map((d, index) => {
              const { node } = d
              console.log(node)
              return (
                <Tr key={`${idx}-${index}`}>
                  <Th>{timeformater(moment(node.time).unix())}</Th>
                  <Th>{ellipseStr(node.hash)}</Th>
                  <Th>{node.status}</Th>
                </Tr>
              )
            })
          })}
        </Tbody>
        {/* <Tfoot>
          <Tr>
            <Th>To convert</Th>
            <Th>into</Th>
            <Th isNumeric>multiply by</Th>
          </Tr>
        </Tfoot> */}
      </Table>
    </TableContainer>
  )
}
