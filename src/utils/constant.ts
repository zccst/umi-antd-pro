/**
 * 常量
 */
// const rootURL = `${location.protocol}//${location.hostname}:${location.port}/api/v1`;
const rootURL = "http://44.238.134.212:8020/api/v1";

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


// 公链列表
export const CHAIN_LIST = [
    {
        value: "Ethereum",
        label: 'Ethereum'
    },
    {
        value: "Goerli",
        label: 'Goerli'
    },
    {
        value: "Polygon - Mumbai",
        label: 'Polygon - Mumbai'
    },
    {
        value: "Binance",
        label: 'Binance'
    },
    {
        value: "Polygon",
        label: 'Polygon'
    },
    {
        value: "Optimism",
        label: 'Optimism'
    },
    {
        value: "Arbitrum",
        label: 'Arbitrum'
    },
    {
        value: "Base Goerli",
        label: 'Base Goerli'
    },
];







