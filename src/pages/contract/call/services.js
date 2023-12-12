import blocknativeIcon from './icons/blocknative-icon'

import { init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import trezorModule from '@web3-onboard/trezor'
import ledgerModule from '@web3-onboard/ledger'
import walletConnectModule from '@web3-onboard/walletconnect'
import coinbaseModule from '@web3-onboard/coinbase'
import portisModule from '@web3-onboard/portis'
import magicModule from '@web3-onboard/magic'
import fortmaticModule from '@web3-onboard/fortmatic'
import torusModule from '@web3-onboard/torus'
import keepkeyModule from '@web3-onboard/keepkey'
import gnosisModule from '@web3-onboard/gnosis'
import web3authModule from '@web3-onboard/web3auth'
import sequenceModule from '@web3-onboard/sequence'
import tahoModule from '@web3-onboard/taho'
import keystoneModule from '@web3-onboard/keystone'
import enkryptModule from '@web3-onboard/enkrypt'
import mewWalletModule from '@web3-onboard/mew-wallet'
import uauthModule from '@web3-onboard/uauth'
import trustModule from '@web3-onboard/trust'
import frontierModule from '@web3-onboard/frontier'
import cedeStoreModule from '@web3-onboard/cede-store'
import gas from '@web3-onboard/gas'
import frameModule from '@web3-onboard/frame'
import infinityWalletModule from '@web3-onboard/infinity-wallet'
import xdefiWalletModule from '@web3-onboard/xdefi'
import zealModule from '@web3-onboard/zeal'
import phantomModule from '@web3-onboard/phantom'
import dcentModule from '@web3-onboard/dcent'
import transactionPreviewModule from '@web3-onboard/transaction-preview'
import venlyModule from '@web3-onboard/venly'
import bloctoModule from '@web3-onboard/blocto'
import arcanaAuthModule from '@web3-onboard/arcana-auth'
import { LOCAL_CHAIN_LIST } from '../../../utils/constant'
// Replace with your DApp's Infura ID
// const INFURA_ID = 'cea9deb6467748b0b81b920b005c10c1'
const INFURA_ID = '9846a5ec6d48438586fb034ea7cb3909'
export const infuraRPC = `https://mainnet.infura.io/v3/${INFURA_ID}`

const dappId = '937627e1-3507-44b8-af10-72728aa5f74b'

const injected = injectedModule({
  custom: [
    // include custom (not natively supported) injected wallet modules here
  ]
  // display all wallets even if they are unavailable
  // displayUnavailable: true
  // but only show Binance and Bitski wallet if they are available
  // filter: {
  //   [ProviderLabel.Binance]: 'unavailable',
  //   [ProviderLabel.Bitski]: 'unavailable'
  // }
  // do a manual sort of injected wallets so that MetaMask and Coinbase are ordered first
  // sort: wallets => {
  //   const metaMask = wallets.find(
  //     ({ label }) => label === ProviderLabel.MetaMask
  //   )
  //   const coinbase = wallets.find(
  //     ({ label }) => label === ProviderLabel.Coinbase
  //   )

  //   return (
  //     [
  //       metaMask,
  //       coinbase,
  //       ...wallets.filter(
  //         ({ label }) =>
  //           label !== ProviderLabel.MetaMask &&
  //           label !== ProviderLabel.Coinbase
  //       )
  //     ]
  //       // remove undefined values
  //       .filter(wallet => wallet)
  //   )
  // }
  // walletUnavailableMessage: wallet => `Oops ${wallet.label} is unavailable!`
})

const coinbase = coinbaseModule()

const walletConnect = walletConnectModule({
  projectId: 'f6bd6e2911b56f5ac3bc8b2d0e2d7ad5'
})
const portis = portisModule({
  apiKey: 'b2b7586f-2b1e-4c30-a7fb-c2d1533b153b'
})

const fortmatic = fortmaticModule({
  apiKey: 'pk_test_886ADCAB855632AA'
})

const web3auth = web3authModule({
  clientId:
    'DJuUOKvmNnlzy6ruVgeWYWIMKLRyYtjYa9Y10VCeJzWZcygDlrYLyXsBQjpJ2hxlBO9dnl8t9GmAC2qOP5vnIGo'
})

const torus = torusModule()
const infinityWallet = infinityWalletModule()
const ledger = ledgerModule({ projectId: 'f6bd6e2911b56f5ac3bc8b2d0e2d7ad5' })
const keepkey = keepkeyModule()
const keystone = keystoneModule()
const gnosis = gnosisModule()
const taho = tahoModule()
const xdefi = xdefiWalletModule()
const zeal = zealModule()
const phantom = phantomModule()
const trust = trustModule()
const frontier = frontierModule()
const cedeStore = cedeStoreModule()

const trezorOptions = {
  email: 'test@test.com',
  appUrl: 'https://www.blocknative.com',
  consecutiveEmptyAccountThreshold: 10
  // containerElement: '#sample-container-el'
}
const trezor = trezorModule(trezorOptions)

const uauthOptions = {
  clientID: 'a25c3a65-a1f2-46cc-a515-a46fe7acb78c',
  walletConnectProjectId: 'f6bd6e2911b56f5ac3bc8b2d0e2d7ad5',
  redirectUri: 'http://localhost:8080/',
  scope:
    'openid wallet email:optional humanity_check:optional profile:optional social:optional'
}
const uauth = uauthModule(uauthOptions)

const magic = magicModule({
  apiKey: 'pk_live_02207D744E81C2BA'
  // userEmail: 'test@test.com'
  // userEmail is optional - if user has already logged in and/or session is still active a login modal will not appear
  // for more info see the @web3-onboard/magic docs
})

const dcent = dcentModule()
const frameWallet = frameModule()
const sequence = sequenceModule()
const enkrypt = enkryptModule()
const mewWallet = mewWalletModule()
const transactionPreview = transactionPreviewModule({
  requireTransactionApproval: true
})

const venly = venlyModule({
  clientId: 'blocknative',
  environment: 'staging'
})
const blocto = bloctoModule()

const arcanaAuth = arcanaAuthModule({
  clientID: 'xar_test_c9c3bc702eb13255c58dab0e74cfa859711c13cb'
})

const initChains = JSON.parse(localStorage.getItem('GLOBAL_CHAINS') || '') || LOCAL_CHAIN_LIST;
console.log('initChains', initChains);

export const initWeb3Onboard = init({
  connect: {
    autoConnectAllPreviousWallet: true
  },
  wallets: [
    injected,
    ledger,
    trezor,
    walletConnect,
    coinbase,
    phantom,
    gnosis,
    trust,
    taho,
    enkrypt,
    infinityWallet,
    mewWallet,
    keepkey,
    keystone,
    magic,
    fortmatic,
    portis,
    torus,
    dcent,
    sequence,
    uauth,
    web3auth,
    zeal,
    frontier,
    xdefi,
    frameWallet,
    cedeStore,
    venly,
    blocto,
    arcanaAuth
  ],
  chains: initChains,
  appMetadata: {
    name: 'Blocknative Web3-Onboard',
    icon: blocknativeIcon,
    description: 'OKX Web3 DevOps for Web3-Onboard',
    recommendedInjectedWallets: [
      { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
      { name: 'MetaMask', url: 'https://metamask.io' }
    ],
    agreement: {
      version: '1.0.0',
      termsUrl: 'https://www.blocknative.com/terms-conditions',
      privacyUrl: 'https://www.blocknative.com/privacy-policy'
    },
    gettingStartedGuide: 'https://blocknative.com',
    explore: 'https://blocknative.com'
  },
  accountCenter: {
    desktop: {
      position: 'topRight',
      enabled: true,
      minimal: false
    }
  },
  // example customizing copy
  i18n: {
    es: {
      connect: {
        selectingWallet: {
          header: 'Carteras disponibles',
          sidebar: {
            heading: 'Comenzar',
            subheading: 'Conecta tu monedero',
            paragraph:
              'Conectar su billetera es como “iniciar sesión” en Web3. Seleccione su billetera de las opciones para comenzar.'
          }
        }
      },
      accountCenter: {
        connectAnotherWallet: 'Conectar otro monedero',
        disconnectAllWallets: 'Desconectar todos los monederos',
        currentNetwork: 'Red actual',
        appInfo: 'Información de la aplicación',
        learnMore: 'Aprende más',
        gettingStartedGuide: 'Guía de introducción',
        smartContracts: 'Contrato(s) inteligente',
        explore: 'Explorar',
        backToApp: 'Volver a dapp',
        poweredBy: 'Funciona con',
        addAccount: 'Añadir cuenta',
        setPrimaryAccount: 'Establecer cuenta principal',
        disconnectWallet: 'Desconectar Wallet'
      }
    }
  },
  apiKey: dappId,
  notify: {
    transactionHandler: transaction => {
      console.log({ transaction })
      if (transaction.eventCode === 'txPool') {
        return {
          // autoDismiss set to zero will persist the notification until the user excuses it
          autoDismiss: 0,
          // message: `Your transaction is pending, click <a href="https://goerli.etherscan.io/tx/${transaction.hash}" rel="noopener noreferrer" target="_blank">here</a> for more info.`,
          // or you could use onClick for when someone clicks on the notification itself
          onClick: () =>
            window.open(`https://goerli.etherscan.io/tx/${transaction.hash}`)
        }
      }
    }
  },
  theme: 'light' // dark
})

// subscribe to a single chain for estimates using the default poll rate of 5 secs
// API key is optional and if provided allows for faster poll rates
export const ethMainnetGasBlockPrices = gas.stream({
  chains: ['0x1'],
  // apiKey: dappId,
  endpoint: 'blockPrices'
})
