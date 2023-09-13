import {
    useAccountCenter,
    useConnectWallet,
    useNotifications,
    useSetChain,
    useWallets,
} from '@web3-onboard/react'
import {
    initWeb3Onboard,
    ethMainnetGasBlockPrices,
    infuraRPC
} from './services'
import { ethers } from 'ethers'
import { GridContent } from '@ant-design/pro-components';
import { Tree, Tabs, Collapse, Switch, Form, Input, Select, Button, Avatar, List, Col, Dropdown, Menu, Row } from 'antd';
const { Panel } = Collapse;
const { TextArea, Search } = Input;
import type { DataNode, TreeProps } from 'antd/es/tree';
import { DownOutlined, SearchOutlined, ReadOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Suspense, useState, useEffect } from 'react';
import ReactJson from 'react-json-view'
import PageLoading from '../components/PageLoading';
import { shortenAddress } from '../../../utils/utils';
import './index.css'
import thumbtackActive from './icons/thumbtack-active.jpg'
import thumbtackDefault from './icons/thumbtack-default.jpg'
import { stringify } from 'querystring';
import { Params } from '../../list/search/applications/data';

const topColResponsiveProps = {
    // xs: 24,
    // sm: 24,
    // md: 12,
    // lg: 8,
    // xl: 8,
    style: { marginBottom: 24 },
};
const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 16, span: 8 },
};

let provider : any

const Call: React.FC = () => {
    const [{ wallet }, connect, disconnect] = useConnectWallet()
    const connectedWallets = useWallets()
    const [web3Onboard, setWeb3Onboard] = useState({})

    const [form] = Form.useForm();
    
    let [methodKey, setMethodKey] = useState(['']);
    let [methodList, setMethodList] = useState([{}]);
    let [addrList, setAddrList] = useState([{}]);
    let [abiJson, setAbiJson] = useState('');
    let [currAddress, setCurrAddress] = useState('');


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
                const { email } = await magicWalletProvider.instance.user.getMetadata()
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



    // 顶部
    const onAtAddress= () => {
        // 关联地址的作用？？？
        console.log("At Address", currAddress);
        // 设置右侧address，如果是临时地址，则全部不再高亮。
        const completeAddr = currAddress;
        setCurrAddress(completeAddr);
        const newList = addrList.map((item: any) => {
            return {...item, isActive: item.addr === completeAddr ? true : false}
        });
        setAddrList(newList);
    }
    const onChangeCurrAddress= (e: any) => {
        // TODO 判断临时地址
        console.log(e.target.value);
        setCurrAddress(e.target.value);
    }

    // 左侧 select查询
    const deptHandleChange = (value: string) => {
        console.log(`selected ${value}`);
    };
    const projectHandleChange = (value: string) => {
        console.log(`selected ${value}`);
    };
    const envHandleChange = (value: string) => {
        console.log(`selected ${value}`);
    };
    const onSearch = () => {
        console.log(`search`);
    };
    // 左侧 树-数据源
    const treeData: DataNode[] = [
        {
          title: 'parent 1',
          key: '0-0',
          children: [
            {
              title: 'parent 1-0',
              key: '0-0-0',
              children: [
                {
                  title: 'leaf',
                  key: '0-0-0-0',
                },
                {
                  title: 'leaf',
                  key: '0-0-0-1',
                },
                {
                  title: 'leaf',
                  key: '0-0-0-2',
                },
              ],
            },
            {
              title: 'parent 1-1',
              key: '0-0-1',
              children: [
                {
                  title: 'leaf',
                  key: '0-0-1-0',
                },
              ],
            },
            {
              title: 'parent 1-2',
              key: '0-0-2',
              children: [
                {
                  title: 'leaf',
                  key: '0-0-2-0',
                },
                {
                  title: 'leaf',
                  key: '0-0-2-1',
                },
              ],
            },
          ],
        },
    ];
    const onTreeSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
        // 发送请求
        // 读写方法
        const read_funcs = [
            {
                "func_name":"_totalSupply",
                "payable":false,
                "inputs":[]
            },
            {
                "func_name":"allowance",
                "payable":false,
                "inputs":[
                    {
                        "p_name": "tokenOwner",
                        "p_type":"address"
                    },
                    {
                        "p_name": "spender",
                        "p_type":"address"
                    }
                ]
            },
            {
                "func_name":"balanceOf",
                "payable":false,
                "inputs":[
                    {
                        "p_name": "tokenOwner",
                        "p_type":"address"
                    }
                ]
            },
            {
                "func_name":"decimals",
                "payable":false,
                "inputs":[
                ]
            },
            {
                "func_name":"name",
                "payable":false,
                "inputs":[
                ]
            },
            {
                "func_name":"safeAdd",
                "payable":false,
                "inputs":[
                    {
                        "p_name": "a",
                        "p_type":"uint256"
                    },
                    {
                        "p_name": "b",
                        "p_type":"uint256"
                    }
                ]
            },
            {
                "func_name":"safeDiv",
                "payable":false,
                "inputs":[
                    {
                        "p_name": "a",
                        "p_type":"uint256"
                    },
                    {
                        "p_name": "b",
                        "p_type":"uint256"
                    }
                ]
            },
            {
                "func_name":"safeMul",
                "payable":false,
                "inputs":[
                    {
                        "p_name": "a",
                        "p_type":"uint256"
                    },
                    {
                        "p_name": "b",
                        "p_type":"uint256"
                    }
                ]
            },
            {
                "func_name":"safeSub",
                "payable":false,
                "inputs":[
                    {
                        "p_name": "a",
                        "p_type":"uint256"
                    },
                    {
                        "p_name": "b",
                        "p_type":"uint256"
                    }
                ]
            },
            {
                "func_name":"symbol",
                "payable":false,
                "inputs":[
                ]
            },
            {
                "func_name":"totalSupply",
                "payable":false,
                "inputs":[
                ]
            },
        ];
        const write_funcs = [
            {
                "func_name":"approve",
                "payable":false,
                "inputs":[
                    {
                        "p_name":"spender",
                        "p_type":"address"
                    },
                    {
                        "p_name":"tokens",
                        "p_type":"uint256"
                    }
                ]
            },
            {
                "func_name":"transfer",
                "payable":false,
                "inputs":[
                    {
                        "p_name":"to",
                        "p_type":"address"
                    },
                    {
                        "p_name":"tokens",
                        "p_type":"uint256"
                    }
                ]
            },
            {
                "func_name":"transferFrom",
                "payable":false,
                "inputs":[
                    {
                        "p_name":"from",
                        "p_type":"address"
                    },
                    {
                        "p_name":"to",
                        "p_type":"address"
                    },
                    {
                        "p_name":"tokens",
                        "p_type":"uint256"
                    }
                ]
            }
        ];
        // 地址
        const addrs = [{
            "addr":"0x349b83EA8f433c66D9107b2Ea4a9938705029534",
            "tag":"whftest",
            "chain_name":"Goerli",
            "chain_id":"5",
            "rpc":"https://ethereum-goerli.publicnode.com"
        },{
            "addr":"0x349b83EA8f433c66D9107b2Ea4a9938705029535",
            "tag":"eth1",
            "chain_name":"ETH",
            "chain_id":"1",
            "rpc":"https://ethereum-goerli.publicnode.com"
        },{
            "addr":"0x349b83EA8f433c66D9107b2Ea4a9938705029536",
            "tag":"polygon100",
            "chain_name":"Polygon",
            "chain_id":"100",
            "rpc":"https://ethereum-goerli.publicnode.com"
        }];
        // abi
        const abi = "[{\"constant\":false,\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"tokens\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"tokens\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"from\",\"type\":\"address\"},{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"tokens\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"name\":\"success\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"tokens\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"tokenOwner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"tokens\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"},{\"constant\":true,\"inputs\":[],\"name\":\"_totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"tokenOwner\",\"type\":\"address\"},{\"name\":\"spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"name\":\"remaining\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"tokenOwner\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"balance\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"decimals\",\"outputs\":[{\"name\":\"\",\"type\":\"uint8\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"a\",\"type\":\"uint256\"},{\"name\":\"b\",\"type\":\"uint256\"}],\"name\":\"safeAdd\",\"outputs\":[{\"name\":\"c\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"a\",\"type\":\"uint256\"},{\"name\":\"b\",\"type\":\"uint256\"}],\"name\":\"safeDiv\",\"outputs\":[{\"name\":\"c\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"a\",\"type\":\"uint256\"},{\"name\":\"b\",\"type\":\"uint256\"}],\"name\":\"safeMul\",\"outputs\":[{\"name\":\"c\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"a\",\"type\":\"uint256\"},{\"name\":\"b\",\"type\":\"uint256\"}],\"name\":\"safeSub\",\"outputs\":[{\"name\":\"c\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"}]";
        read_funcs.map((item, index) => {
            Object.assign(item, { isRead: true });
        })
        write_funcs.map((item, index) => {
            Object.assign(item, { isRead: false });
        })
        const finalArr = read_funcs.concat(write_funcs);
        setMethodList(finalArr);
        setAddrList(addrs);
        setAbiJson(abi);
    };

    // 中间 折叠面板-数据源
    const onFinish = (values: any) => {
        console.log(values);
    };
    const tryToGetNode = (e: any) => {
        console.log('e.target', e.target, 'e.target.parentNode', e.target.parentNode);
        let strFields = e.target.getAttribute('data-fields');
        if (!strFields) {
            strFields = e.target.parentNode.getAttribute('data-fields');
        }
        return strFields;
    }
    const onOneFormReset = (e: any) => {
        const strFields = tryToGetNode(e);
        const arrFileds = strFields.split(',');
        let paramObj: any = {};
        let prefix_index = 0;
        arrFileds.map((item: any, index: number) => {
            prefix_index = item.split('-')[0];
            paramObj[item] = '';
        });
        paramObj[prefix_index + '-result'] = '';
        form.setFieldsValue(paramObj);
    };
    const onOneFormClick = (e: any) => {
        const strFields = tryToGetNode(e);
        const arrFileds = strFields.split(',');
        let paramObj: any = {};
        const allData = form.getFieldsValue();
        let prefix_index = 0;
        arrFileds.map((item: any, index: number) => {
            prefix_index = item.split('-')[0];
            paramObj[item.split('-')[1]] = allData[item];
        });
        console.log('paramObj', paramObj);
        // 发请求
        let resultObj: any = {};
        resultObj[prefix_index + '-result'] = JSON.stringify(paramObj);
        form.setFieldsValue(resultObj);
    };
    const renderForm = (inputArr: [], idx: number) => {
        console.log('inputArr', inputArr);
        const resetBtnClass = inputArr.length > 0 ? 'reset-btn-visible' : 'reset-btn-hidden';
        const fieldArr: string[] = [];
        return <>
            {
                inputArr.map((item: any, index) => {
                    const fieldName = idx + '-' + item.p_name;
                    fieldArr.push(fieldName);
                    return <Form.Item name={fieldName} label={item.p_name} key={idx + '-' + item.p_name + index} rules={[{ required: true }]} className='form-position-input'>
                        {item.p_type.indexOf('[') >= 0 ?
                        <TextArea placeholder={item.p_type} allowClear autoSize />
                        :
                        <Input placeholder={item.p_type} allowClear />
                        }
                    </Form.Item>
                })
            }
            <Form.Item {...tailLayout}>
                <Button data-fields={fieldArr.join(',')} className={resetBtnClass} onClick={onOneFormReset}>重置</Button>&nbsp;&nbsp;
                <Button data-fields={fieldArr.join(',')} type="primary" onClick={onOneFormClick}>执行</Button>
            </Form.Item>
            <Form.Item label="输出结果：" name={`${idx}-result`}>
                <TextArea className='form-position-result' autoSize />
            </Form.Item>
        </>;
    }
    const renderPanel = (item: any, index: any) => {
        const color = item.isRead ? 'read' : 'write';
        return (
            item.func_name ?
            <Panel header={`${item.func_name}`} key={index} className={`func-${color}-color`} extra={genExtra(item.isRead)}>
                {renderForm(item.inputs, index)}
            </Panel>
            :
            <div key={index}></div>
        )
    }
    const genExtra = (isRead: boolean) => (
        isRead ?
        <>
            <ReadOutlined
            onClick={event => {
                // If you don't want click extra trigger collapse, you can prevent this:
                // event.stopPropagation();
            }}
            />
            <span className='icon-position'>READ</span>
        </>
        :
        <>
            <EditOutlined
            onClick={event => {
                // If you don't want click extra trigger collapse, you can prevent this:
                // event.stopPropagation();
            }}
            />
            <span className='icon-position'>WRITE</span>
        </>
      );
    // 中间 全部方法 打开/关闭
    const onSwitchChange = (checked: boolean) => {
        console.log(`switch to ${checked}`);
        if (checked) {
            let arrIndex = methodList.map((item, index) => {
                return index.toString();
            });
            setMethodKey(arrIndex);
        } else {
            setMethodKey([]);
        }
    };
    // 中间 点击单个方法 打开/关闭
    const onMethodChange = (key: string | string[]) => {
        setMethodKey(key);console.log(key);
    };


    // 右侧 地址列表
    const onAddressClick = (e: any) => {
        const completeAddr = e.target.getAttribute('data-complete-addr');
        setCurrAddress(completeAddr);
        const newList = addrList.map((item: any) => {
            return {...item, isActive: item.addr === completeAddr ? true : false}
        });
        setAddrList(newList);
    }
    const renderAddrList = (addrs: any) => {
        if (addrs.length === 1 && Object.keys(addrs[0]).length === 0) {
            return '';
        }
        const data = addrs.map((item: any, index: number) => {
            return {
                title: shortenAddress(item.addr, 15),
                completeAddr: item.addr,
                isActive: item.isActive,
                avatar: item.isActive ?  thumbtackActive : thumbtackDefault,
                description: `${item.chain_name} (chain_id = ${item.chain_id}) 标签:${item.tag}`
            }
        });
        return <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item: any) => (
                <List.Item className={`address-${item.isActive ? 'active' : ''} `}>
                    <List.Item.Meta
                        avatar={<Avatar src={item.avatar} />}
                        title={<a data-complete-addr={item.completeAddr} onClick={onAddressClick}>{item.title}</a>}
                        description={`${item.description}`}
                    />
                </List.Item>
            )}
        />
        // return shortenAddress(addrs[0].addr);
    }
    const renderAbiJson = (abi: any) => {
        return abi ? <ReactJson src={JSON.parse(abi)} /> : abi;
    }

    

    return <GridContent>
        <>
            {Object.keys(web3Onboard).length ? <section >
                <div className='user-info-basic'>
                    <div className='header-align-left'>
                        当前ABI： 项目1 - prod - 合约名称1-abi - v1.1[latest]
                    </div>
                    <div className='header-align-right'>
                        {wallet && (<Button
                            onClick={async () => {
                                const walletsConnected = await disconnect(wallet)
                                console.log('connected wallets: ', walletsConnected)
                                window.localStorage.removeItem('connectedWallets')
                            }}
                        >
                            断开钱包
                        </Button>
                        )}
                    </div>
                </div>
                <div className='user-info-container'>
                    <div>合约部署地址： 0x430ee6d7e39b7200f6ed410f2e66c1127924d786</div>
                    <div>
                        {!wallet && (
                        <Button
                            onClick={async () => {
                            const walletsConnected = await connect()
                            console.log('connected wallets: ', walletsConnected)
                            }}
                        >
                            连接钱包
                        </Button>
                        )}
                        {wallet && (
                        <div  className='header-align-right'>
                            <Input.Group compact>
                                <Input 
                                    placeholder="可输入临时地址，或从右侧选择常用地址"
                                    style={{ width: 330 }} 
                                    allowClear
                                    defaultValue="" 
                                    value={currAddress}
                                    onChange={onChangeCurrAddress}
                                    />
                                <Button type="primary" onClick={onAtAddress}>At Address</Button>
                            </Input.Group>
                        </div>
                        )}
                    </div>
                </div>
            </section>
            :
            <div>Loading...</div>
            }


            <Suspense fallback={<PageLoading />}>
                <Row
                    gutter={24}
                    style={{
                        marginTop: 0,
                    }}
                    >
                    <Col span={5} {...topColResponsiveProps}>
                        <div className='search-condition-title'>部门：</div>
                        <Select
                            defaultValue="NFT"
                            style={{ width: '100%' }}
                            onChange={deptHandleChange}
                            options={[
                                { value: 'NFT', label: 'NFT' },
                                { value: 'DEX', label: 'DEX' },
                                { value: 'EARN', label: 'EARN' },
                                { value: 'ChainApplication', label: 'ChainApplication' },
                            ]}
                        />
                        <div className='search-condition-title'>项目：</div>
                        <Select
                            defaultValue="NFT1"
                            style={{ width: '100%' }}
                            onChange={projectHandleChange}
                            options={[
                                { value: 'NFT1', label: 'NFT1' },
                                { value: 'DEX1', label: 'DEX1' },
                                { value: 'EARN1', label: 'EARN1' },
                                { value: 'ChainApplication1', label: 'ChainApplication1' },
                            ]}
                        />
                        <div className='search-condition-title'>环境：</div>
                        <Select
                            defaultValue="prod"
                            style={{ width: '100%' }}
                            onChange={envHandleChange}
                            options={[
                                { value: 'prod', label: 'prod' },
                                { value: 'test', label: 'test' },
                            ]}
                        />
                        <div className='search-condition-title'>
                            <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>查询</Button>
                        </div>
                        
                        <Tree
                            showLine
                            switcherIcon={<DownOutlined />}
                            defaultExpandedKeys={['0-0-0']}
                            onSelect={onTreeSelect}
                            treeData={treeData}
                        />
                    </Col>
                    <Col span={11} {...topColResponsiveProps}>
                        <div className='method-header'>
                            <div>合约读写方法：</div>
                            <div>
                                <span className='all-open-close'>全部展开/折叠</span>
                                <Switch checkedChildren="打开" unCheckedChildren="关闭" onChange={onSwitchChange} />
                            </div>
                        </div>
                        <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
                            <Collapse bordered={false} activeKey={methodKey} defaultActiveKey={methodKey} onChange={onMethodChange}>
                                {
                                    methodList.map((item, index) => renderPanel(item, index))
                                }
                            </Collapse>
                        </Form>
                    </Col>
                    <Col span={8} {...topColResponsiveProps}>
                        <Tabs
                            defaultActiveKey="1"
                            type="card"
                            centered
                            items={[
                                {
                                    label: "Address",
                                    key: "1",
                                    children: renderAddrList(addrList),
                                },
                                {
                                    label: "ABI json",
                                    key: "2",
                                    children: renderAbiJson(abiJson),
                                }
                            ]}
                        />
                    </Col>
                </Row>
            </Suspense>
        </>
    </GridContent>;
};


export default Call;