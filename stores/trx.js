import Rekv from 'rekv'

const store = new Rekv({
  show: false,
  pendingTrx: {},
})

export const setInfoModalStatus = (flag) => {
  store.setState({ showInfoSetModal: flag })
}

export default store
