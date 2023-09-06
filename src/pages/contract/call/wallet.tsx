import React, { useState, useEffect } from 'react'
import { Input } from 'antd';
import { ethers } from 'ethers'
const { Search } = Input;
import {
  initWeb3Onboard,
  ethMainnetGasBlockPrices,
  infuraRPC
} from './services'
import {
  useAccountCenter,
  useConnectWallet,
  useNotifications,
  useSetChain,
  useWallets,
  useSetLocale
} from '@web3-onboard/react'
import './wallet.css'
import Header from './views/Header/Header'


let provider : any

const App = () => {
  const [{ wallet }, connect, disconnect, updateBalances, setWalletModules] =
    useConnectWallet()
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain()
  const connectedWallets = useWallets()
  const updateAccountCenter = useAccountCenter()
  const updateLocale = useSetLocale()

  const [web3Onboard, setWeb3Onboard] = useState(null)

  const [bnGasPrices, setBNGasPrices] = useState('')
  const [rpcInfuraGasPrices, setRPCInfuraGasPrices] = useState({})
  const [toAddress, setToAddress] = useState('')
  // default test transaction to Goerli
  const [toChain, setToChain] = useState('0x5')
  const [locale, setLocale] = useState('en')
  const [accountCenterSize, setAccountCenterSize] = useState('normal')

  useEffect(() => {
    setWeb3Onboard(initWeb3Onboard)
  }, [])

  useEffect(() => {
    if (!connectedWallets.length) return

    const connectedWalletsLabelArray = connectedWallets.map(
      ({ label }) => label
    )
    // Check for Magic Wallet user session
    if (connectedWalletsLabelArray.includes('Magic Wallet')) {
      const [magicWalletProvider] = connectedWallets.filter(
        provider => provider.label === 'Magic Wallet'
      )
      async function setMagicUser() {
        try {
          const { email } =
            await magicWalletProvider.instance.user.getMetadata()
          const magicUserEmail = localStorage.getItem('magicUserEmail')
          if (!magicUserEmail || magicUserEmail !== email)
            localStorage.setItem('magicUserEmail', email)
        } catch (err) {
          throw err
        }
      }
      setMagicUser()
    }
  }, [connectedWallets, wallet])

  useEffect(() => {
    if (!wallet?.provider) {
      provider = null
    } else {
      provider = new ethers.providers.Web3Provider(wallet.provider, 'any')
    }
  }, [wallet])

  useEffect(() => {
    ethMainnetGasBlockPrices.subscribe(estimates => {
      setBNGasPrices(estimates[0].blockPrices[0].estimatedPrices)
    })
  }, [])

  // 一直动态更新。因为bnGasPrices一直在变化。
  useEffect(() => {
    async function getEtherGasFromRPC() {
      const customHttpProvider = new ethers.providers.JsonRpcProvider(infuraRPC)
      const fee = await customHttpProvider.getFeeData()
      
      const gasPrice = fee.gasPrice || 0;
      const maxPriorityFeePerGas = fee.maxPriorityFeePerGas || 0
      const maxFeePerGas = fee.maxFeePerGas || 0

      const cleanFees = {
        price: ethers.utils.formatUnits(gasPrice, 'gwei'),
        maxPriorityFeePerGas: ethers.utils.formatUnits(
          maxPriorityFeePerGas,
          'gwei'
        ),
        maxFeePerGas: ethers.utils.formatUnits(maxFeePerGas, 'gwei')
      }
      // console.log('cleanFees', cleanFees);
      setRPCInfuraGasPrices(cleanFees)
    }
    getEtherGasFromRPC()
  }, [bnGasPrices])

  const gweiToWeiHex = (gwei: number) => {
    return `0x${(gwei * 1e9).toString(16)}`
  }

  if (!web3Onboard) return <div>Loading...</div>

  return (
    <main>
      <section >
        <div className='user-info-basic'>
          <div className='header-align-left'>
            当前ABI： 项目1 - prod - 合约名称1-abi - v1.1[latest]
          </div>
          <div>
            <button
              className="bn-demo-button"
              onClick={async () => {
                const walletsConnected = await disconnect(wallet)
                console.log('connected wallets: ', walletsConnected)
                window.localStorage.removeItem('connectedWallets')
              }}
            >
              断开钱包
            </button>
          </div>
        </div>
        <div className='user-info-container'>
          <div>合约部署地址： 0x430ee6d7e39b7200f6ed410f2e66c1127924d786</div>
          <div>
            {!wallet && (
              <button
                className="bn-demo-button"
                onClick={async () => {
                  const walletsConnected = await connect()
                  console.log('connected wallets: ', walletsConnected)
                }}
              >
                连接钱包
              </button>
            )}
            {wallet && (
              <div className='header-align-left'>
                <Search
                  placeholder="可输入临时地址，或从右侧选择常用地址"
                  allowClear
                  enterButton="At Address"
                  size="large"
                  onSearch={ () => {
                    console.log("At Address");
                  }
                  }
                />
              </div>
            )}
          </div>
        </div>
        
        
      </section>

      <section className="main">
        
      </section>
    </main>
  )
}

export default App
