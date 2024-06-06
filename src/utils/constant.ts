/**
 * 常量
 */
// const rootURL = `${location.protocol}//${location.hostname}:${location.port}/api/v1`;
export const rootURL = "http://44.238.134.212:8020/api/v1";

// 部门和项目列表
export const deptProjUrl = rootURL + "/project/list";

// call页
export const getProjListUrl = rootURL + "/dept/project"; // 获取项目列表
export const getAbiInfoUrl = rootURL + "/abi/info"; // 获取abi信息，主要是读写方法

// abi和addr管理页
export const abiUrlPrefix = rootURL + "/abi"; // abi管理页的URL前缀
export const addrUrlPrefix = rootURL + "/addr"; // address管理页的URL前缀

// 项目管理页
export const projUrlPrefix = rootURL + "/project"; // create / delete / access_list / update

// 链管理
export const chainUrlPrefix = rootURL + "/chain"; // create / delete / access_list / update

// 用户管理
export const userUrlPrefix = rootURL + "/users"; // create / delete / access_list / update

export const LOGINPATH = '/user/login';

// version2 新合约create2部署
export const create2UrlPrefix = rootURL + "/create2"; // create / delete / access_list / update

// version3 批量空投
export const batchAirdropUrlPrefix = rootURL + "/airdrop";

// v4
export const noPrivateKeyUrlPrefix = rootURL + "/nopri";

// 空投类型列表 2024-04-09
export const AIRDROP_TYPE_LIST = [
  { value : "erc20_same_num", label: "ERC20数量相同" },
  { value : "erc20_diff_num", label: "ERC20数量不同" },
  { value : "native_same_num", label: "原生代币数量相同" },
  { value : "native_diff_num", label: "原生代币数量不同" },
];


// 公链列表
export const LOCAL_CHAIN_LIST = [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum',
      rpcUrl: 'https://mainnet.infura.io/v3/9846a5ec6d48438586fb034ea7cb3909',
      secondaryTokens: [
        {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z" fill="#2775C9"/>
  <path d="M7.875 13.75C4.63 13.75 2 11.12 2 7.875C2 4.63 4.63 2 7.875 2C11.12 2 13.75 4.63 13.75 7.875C13.75 9.43315 13.131 10.9275 12.0293 12.0293C10.9275 13.131 9.43315 13.75 7.875 13.75ZM7.525 5.695C7.20355 5.71094 6.89968 5.84646 6.67303 6.07496C6.44638 6.30346 6.31333 6.60843 6.3 6.93C6.3 7.535 6.67 7.93 7.455 8.095L8.005 8.225C8.54 8.35 8.76 8.53 8.76 8.835C8.76 9.14 8.375 9.44 7.875 9.44C7.6974 9.45628 7.5188 9.42225 7.35964 9.34178C7.20048 9.26132 7.06718 9.13767 6.975 8.985C6.94769 8.92707 6.90457 8.87803 6.85061 8.84353C6.79665 8.80903 6.73404 8.79048 6.67 8.79H6.375C6.35231 8.7942 6.33068 8.80285 6.31135 8.81544C6.29202 8.82804 6.27537 8.84433 6.26236 8.86338C6.24935 8.88243 6.24023 8.90387 6.23554 8.92646C6.23084 8.94905 6.23066 8.97234 6.235 8.995C6.30686 9.28828 6.47393 9.54945 6.71007 9.73764C6.94621 9.92583 7.23808 10.0304 7.54 10.035V10.455C7.54 10.5485 7.57714 10.6381 7.64324 10.7043C7.70935 10.7704 7.79901 10.8075 7.8925 10.8075C7.98599 10.8075 8.07565 10.7704 8.14176 10.7043C8.20786 10.6381 8.245 10.5485 8.245 10.455V10.03C8.58639 10.0261 8.91279 9.88913 9.15467 9.64818C9.39655 9.40724 9.53481 9.08137 9.54 8.74C9.54 8.105 9.175 7.74 8.31 7.555L7.81 7.445C7.31 7.32 7.075 7.155 7.075 6.875C7.075 6.595 7.375 6.285 7.875 6.285C8.03247 6.26855 8.19133 6.29804 8.3324 6.36991C8.47348 6.44178 8.59073 6.55295 8.67 6.69C8.70213 6.75844 8.75301 6.81638 8.81672 6.85708C8.88044 6.89779 8.95439 6.91961 9.03 6.92H9.265C9.31843 6.90693 9.3646 6.87342 9.39358 6.82667C9.42257 6.77992 9.43205 6.72367 9.42 6.67C9.35226 6.39922 9.20073 6.15674 8.98704 5.97717C8.77335 5.7976 8.5084 5.69009 8.23 5.67V5.325C8.23 5.23151 8.19286 5.14185 8.12675 5.07574C8.06065 5.00964 7.97099 4.9725 7.8775 4.9725C7.78401 4.9725 7.69435 5.00964 7.62824 5.07574C7.56214 5.14185 7.525 5.23151 7.525 5.325V5.695ZM3.47 7.875C3.47057 8.79603 3.76049 9.69361 4.29879 10.441C4.8371 11.1883 5.59659 11.7477 6.47 12.04H6.54C6.59967 12.04 6.6569 12.0163 6.6991 11.9741C6.74129 11.9319 6.765 11.8747 6.765 11.815V11.71C6.76516 11.6169 6.73769 11.5259 6.68606 11.4485C6.63444 11.371 6.56098 11.3106 6.475 11.275C5.7948 11.0004 5.21217 10.5289 4.80189 9.92084C4.39161 9.3128 4.1724 8.59602 4.1724 7.8625C4.1724 7.12898 4.39161 6.4122 4.80189 5.80416C5.21217 5.19611 5.7948 4.72455 6.475 4.45C6.56058 4.41524 6.63387 4.35577 6.68552 4.27919C6.73717 4.2026 6.76484 4.11237 6.765 4.02V3.905C6.76532 3.87123 6.7575 3.83789 6.74219 3.80779C6.72689 3.77769 6.70455 3.75173 6.67707 3.7321C6.64959 3.71248 6.61779 3.69976 6.58435 3.69505C6.55092 3.69033 6.51684 3.69374 6.485 3.705C5.60798 3.99505 4.84465 4.55405 4.30342 5.30262C3.76218 6.05119 3.47057 6.95126 3.47 7.875ZM12.28 7.875C12.2784 6.95482 11.988 6.05836 11.4497 5.31201C10.9115 4.56566 10.1526 4.00707 9.28 3.715H9.205C9.14267 3.715 9.0829 3.73976 9.03883 3.78383C8.99476 3.8279 8.97 3.88767 8.97 3.95V4.025C8.97202 4.12143 9.00188 4.21523 9.056 4.29507C9.11012 4.37492 9.18617 4.4374 9.275 4.475C9.95365 4.75036 10.5347 5.22195 10.9438 5.82942C11.3529 6.43689 11.5714 7.15262 11.5714 7.885C11.5714 8.61738 11.3529 9.33311 10.9438 9.94058C10.5347 10.5481 9.95365 11.0196 9.275 11.295C9.18787 11.333 9.11337 11.395 9.06024 11.4738C9.0071 11.5527 8.97754 11.645 8.975 11.74V11.825C8.97543 11.8621 8.98462 11.8985 9.00182 11.9313C9.01902 11.9642 9.04375 11.9925 9.07398 12.0139C9.10421 12.0354 9.13909 12.0494 9.17576 12.0548C9.21244 12.0602 9.24987 12.0568 9.285 12.045C10.1583 11.7515 10.9173 11.1911 11.4547 10.4428C11.9921 9.69451 12.2808 8.79627 12.28 7.875Z" fill="white"/>
  </svg>`
        },
        {
          address: '0x111111111117dc0aa78b770fa6a738034120c302',
          icon: `https://avatars.githubusercontent.com/u/43341157`
        }
      ]
    },
    {
      id: '0x5',
      token: 'ETH',
      label: 'Goerli',
      rpcUrl: `https://goerli.infura.io/v3/9846a5ec6d48438586fb034ea7cb3909`
    },
    {
      id: '0x13881',
      token: 'MATIC',
      label: 'Polygon - Mumbai',
      rpcUrl: 'https://matic-mumbai.chainstacklabs.com	'
    },
    {
      id: '0x38',
      token: 'BNB',
      label: 'Binance',
      rpcUrl: 'https://bsc-dataseed.binance.org/'
    },
    {
      id: '0x89',
      token: 'MATIC',
      label: 'Polygon',
      rpcUrl: 'https://matic-mainnet.chainstacklabs.com'
    },
    {
      id: '0xfa',
      token: 'FTM',
      label: 'Fantom',
      rpcUrl: 'https://rpc.ftm.tools/'
    },
    {
      id: 10,
      token: 'OETH',
      label: 'Optimism',
      rpcUrl: 'https://mainnet.optimism.io'
    },
    {
      id: 42161,
      token: 'ARB-ETH',
      label: 'Arbitrum',
      rpcUrl: 'https://rpc.ankr.com/arbitrum'
    },
    {
      id: 84531,
      token: 'ETH',
      label: 'Base Goerli',
      rpcUrl: 'https://goerli.base.org'
    }
];
// 公链列表，改为动态获取
const global_chains = JSON.parse(localStorage.getItem('GLOBAL_CHAINS') || '') || LOCAL_CHAIN_LIST;
export const CHAIN_LIST = global_chains.map((item: any) => {
    return {
        value: item.label,
        label: item.label
    }
});




// 2024-06-06 添加OKEngine登录
export const OKENGINE = 'okengine'


