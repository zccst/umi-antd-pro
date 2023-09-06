import React from 'react'
import networkEnum from '../../networkEnum'
import BNLogo from '../../icons/blocknative-logo-dark.svg'
import avatarPlaceholder from '../../icons/avatar-placeholder.png'
import './Header.css'

const Header = (props: { connectedChain: any; address: any; balance: any; ens: any, wallet: any, connect: any, disconnect: any }) => {
  const { connectedChain, address, balance, ens, wallet, connect, disconnect } = props
  console.log(connectedChain, address, balance, ens, wallet, connect, disconnect);

  return (
    <header className="user-info-container">
      <div className="user-info">
        {/* {connectedChain && connectedChain?.id && (
          <span>{networkEnum?.[connectedChain.id] || 'local'} Network</span>
        )} */}
        
        {ens?.name ? (
          <span>
            <img
              className="user-avatar"
              // This will change when we switch to Viem
              src={(ens.avatar && ens.avatar.url) ? ens.avatar.url : avatarPlaceholder}
              alt="avatar"
            ></img>
            <div
              style={{
                marginLeft: '10px'
              }}
            >
              {ens.name}
            </div>
          </span>
        ) : (
          address && <span className="user-address">{address}</span>
        )}

        {balance != null && (
          <span>
            {Object.keys(balance).map((key, i) => (
              <div key={key}>
                {balance[key]} {key}
              </div>
            ))}
          </span>
        )}

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
        )}
        
      </div>
      <div>

      </div>
    </header>
  )
}

export default Header
