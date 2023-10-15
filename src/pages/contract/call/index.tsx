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
import { Tree, Tabs, Collapse, Switch, Form, Input, Select, Button, Avatar, List, Col, Dropdown, Menu, Row, message, Tag, version } from 'antd';
const { Panel } = Collapse;
const { TextArea, Search } = Input;
import type { DataNode, TreeProps } from 'antd/es/tree';
import { DownOutlined, SearchOutlined, ReadOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Suspense, useState, useEffect } from 'react';
import ReactJson from 'react-json-view'

import request from '../../../utils/req';

import PageLoading from '../components/PageLoading';
import { shortenAddress } from '../../../utils/utils';
import { deptProjUrl, getProjListUrl, getAbiInfoUrl } from '../../../utils/constant'
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
    const [{ wallet }, connect, disconnect] = useConnectWallet(); // 钱包
    const [{ chains, connectedChain, settingChain }, setChain] = useSetChain(); // 链
    const [notifications, customNotification, updateNotify] = useNotifications(); // 通知
    const connectedWallets = useWallets(); // 已连接钱包，是数组
    const updateAccountCenter = useAccountCenter(); // 用户中心
    const [web3Onboard, setWeb3Onboard] = useState<{[key: string]: any}>({});

    const [form] = Form.useForm();
    
    

    // 部门project列表，从服务端获取
    const [deptProjListFromServer, setDeptProjListFromServer] = useState({deptList: [], projListbyDept: {}});
    const [currDepartmentId, setCurrDepartmentId] = useState('2'); // 默认NFT
    const [currProjectId, setCurrProjectId] = useState('');
    const [currEnv, setCurrEnv] = useState('prod');

    // treeDate
    const [treeDataSource, setTreeDataSource] = useState([]);
    const [titleInfo, setTitleInfo] = useState({contractName: '', version: ''});
    // const [abiInfoFromServe, setAbiInfoFromServe] = useState({ abi: '', read_funcs: [], write_funcs: [], addrs: []});
    
    let [methodKey, setMethodKey] = useState(['']);
    let [methodList, setMethodList] = useState([{}]);
    let [addrList, setAddrList] = useState([{}]);
    let [abiJson, setAbiJson] = useState('');
    let [currAddress, setCurrAddress] = useState('');

    // 当前合约对象
    let [currContract, setCurrContract] = useState({});


    useEffect(() => {
        setWeb3Onboard(initWeb3Onboard);
        updateAccountCenter({ minimal: false })
        return () => { // 处理已登录的面板
            updateAccountCenter({ minimal: true })
        }
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


    useEffect(() => {
        request
          .get(deptProjUrl)
          .then(function(response) {
            if (response.code === 0) {
              const data = response.data;
              let targetOptionObj: any = {};
              let deptList: any = [];
              for (let i = 0; i < data.length; i++) {
                // const tmpArr1 = [{value: 'all', label: '全部'}];
                const tmpArr2 = data[i].projects.map((item: any) => {
                  return {
                    value: '' + item.id,
                    label: item.name,
                  }
                })
                targetOptionObj['' + data[i].dept_id] = {
                  name: data[i].dept_name,
                //   child: tmpArr1.concat(tmpArr2),
                  child: tmpArr2,
                };
                deptList.push({
                    value: '' + data[i].dept_id,
                    label: data[i].dept_name,
                });
              }
              // console.log('targetOptionObj', targetOptionObj);
              setDeptProjListFromServer({
                deptList: deptList,
                projListbyDept: targetOptionObj,
              });
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      }, []);



    // 顶部
    // 在调用AtAddress验证地址合法性
    const onAtAddress= () => {
        console.log("At Address", currAddress);
        // 检查非空地址
        if (!currAddress) {
            message.warning('请从右侧Address中选择一个地址，或输入一个临时地址。');
            return false;
        }
        // 检查地址长度
        // TODO

        // 设置右侧address，如果是临时地址，则全部不再高亮。
        setCurrAddress(currAddress);
        const newList = addrList.map((item: any) => {
            return {...item, isActive: item.addr === currAddress ? true : false}
        });
        setAddrList(newList);

        // 还原合约
        // 合约地址，signer, provider
        const signer = provider.getUncheckedSigner();
        const contract = new ethers.Contract(currAddress, abiJson, signer);
        setCurrContract(contract);

        message.success("At Address地址 " + currAddress + " 成功");
    }
    const onChangeCurrAddress= (e: any) => {
        setCurrAddress(e.target.value);// TODO 判断临时地址。此处不再验证合法性。
    }

    // 左侧 select查询
    const deptHandleChange = (value: string) => {
        console.log(`selected ${value}`);
        setCurrDepartmentId(value);
        const projectArr = (deptProjListFromServer.projListbyDept as any)[value]?.child;
        projectArr.length ? setCurrProjectId(projectArr[0].value) : ''; //第0个元素
    };
    const projectHandleChange = (value: string) => {
        console.log(`selected ${value}`);
        setCurrProjectId(value);
    };
    const envHandleChange = (value: string) => {
        console.log(`selected ${value}`);
        setCurrEnv(value);
    };
    const onSearch = () => {
        const proj = currProjectId;
        if (!proj) {
            message.warning('请先从项目下拉列表中选择一个项目，再查询！');
            return false;
        }
        const params = {
            dept_id: +currDepartmentId,
            project_id: +currProjectId,
            env: currEnv
        }
        console.log(`search`, params);
        request
            .get(getProjListUrl, {
                params
            })
            .then(function(response) {
                console.log(response);
                if (response.code === 0) {
                    const data = response.data;
                    const treeDataRoot = data.abis.map((item: any, index: number) => {
                        const childArr = item.versions.map((version: any, i: number) => {
                            return {
                                title: version.version,
                                key: index + '-' + version.id,
                            }
                        });
                        return {
                            title: item.name + ' [' + (item.updatable ? '可升级' : '不可升级') + ']',
                            key: index,
                            children: childArr
                        }
                    });

                    setTreeDataSource(treeDataRoot)
                }
            })
            .catch(function(error) {
                console.log(error);
            });
    };

    const onTreeSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info, treeDataSource);
        if (!selectedKeys.length) {
            message.warning('没有选中树节点，请先选择节点！');
            return false;
        }
        const selectedContractKey = (selectedKeys[0] as any).split('-')[0];
        const selectedVersionKey = (selectedKeys[0] as any).split('-')[1];
        // 渲染title
        let contractName = '';
        let version = '';
        treeDataSource.map((contractItem: any) => {
            if (contractItem.key === +selectedContractKey) {
                contractName = contractItem.title;
                contractItem.children.map((item: any) => {
                    if (item.key === selectedKeys[0]) {
                        version = item.title;
                        setTitleInfo({contractName: contractName, version: version})
                    }
                });
            }
        });
        const params = {
            id: (selectedKeys[0] as any).split('-')[1],
        }
        console.log(`abi/info`, params);
        // 发送请求
        request
            .get(getAbiInfoUrl, {
                params
            })
            .then(function(response) {
                console.log(response);
                if (response.code === 0) {
                    console.log(response.data);
                    // setAbiInfoFromServe({});
                    let read_funcs = response.data.read_funcs;
                    let write_funcs = response.data.write_funcs;
                    const addrs = response.data.addrs;
                    const abi = response.data.abi;

                    read_funcs.map((item: any, index: number) => {
                        Object.assign(item, { isRead: true });
                    })
                    write_funcs.map((item: any, index: number) => {
                        Object.assign(item, { isRead: false });
                    })
                    const finalArr = read_funcs.concat(write_funcs);
                    setMethodList(finalArr);
                    setAddrList(addrs);
                    setAbiJson(abi);
                }
            })
            .catch(function(error) {
                console.log(error);
            });
        
    };

    // 中间 折叠面板-数据源
    const onFinish = (values: any) => {
        console.log(values);
    };
    const tryToGetNode = (e: any) => {
        // console.log('e.target', e.target, 'e.target.parentNode', e.target.parentNode);
        let func_name = e.target.getAttribute('data-func_name');
        let strFields = e.target.getAttribute('data-fields');
        let idx = e.target.getAttribute('data-idx');
        if (!func_name) {
            func_name = e.target.parentNode.getAttribute('data-func_name');
        }
        if (!strFields) {
            strFields = e.target.parentNode.getAttribute('data-fields');
        }
        if (!idx) {
            idx = e.target.parentNode.getAttribute('data-idx');
        }
        console.log('tryToGetNode', func_name, strFields, idx);
        return {
            func_name: func_name,
            strFields: strFields,
            idx: idx
        };
    }
    const onOneFormReset = (e: any) => {
        const oneFormInfo = tryToGetNode(e);
        const arrFileds = oneFormInfo.strFields.split(',');
        let paramObj: any = {};
        arrFileds.map((item: any, index: number) => {
            paramObj[item] = '';
        });
        paramObj[oneFormInfo.idx + '-result'] = '';
        form.setFieldsValue(paramObj);
    };
    // 中间 发交易
    const readyToTransact = async () => {
        if (!wallet) {
          const walletSelected = await connect()
          if (!walletSelected) return false
        }
        // prompt user to switch to Goerli for test
        await setChain({ chainId: connectedChain?.id || '0x5' })
    
        return true
    }
    const onOneFormClick = async(e: any) => {
        // 检查非空地址
        if (!currAddress) {
            message.warning('请先输入关联地址，再来执行读写方法。');
            return false;
        }
        // 检查合约实例化
        if (!Object.keys(currContract)) {
            message.warning('请先点击“关联地址”按钮，再来执行读写方法。');
            return false;
        }
        // 检查钱包连接情况
        if (!wallet) {
            const walletSelected = await connect()
            if (!walletSelected) {
                message.warning("请先连接钱包，再调用。");
                return false
            }
        }

        const oneFormInfo = tryToGetNode(e);
        const allData = form.getFieldsValue();
        let paramsValue: any = [];
        if (oneFormInfo.strFields) {
            const arrFileds = oneFormInfo.strFields.split(',');
            arrFileds.map((item: any, index: number) => {
                paramsValue.push(allData[item]);
            });
        }
        // console.log('paramObj', paramsValue, currContract);
        // 发请求
        console.log('before call contract:', allData, oneFormInfo, paramsValue);
        let resultString;
        try {
            const res = await (currContract as any)[oneFormInfo.func_name](...paramsValue);
            resultString = res.toString()
            console.log('success call', res, resultString);
        } catch (Error) {
            resultString = Error;
            console.log('exception call', Error);
        }
        
        
        let resultObj: any = {};
        resultObj[oneFormInfo.idx + '-result'] = resultString;
        form.setFieldsValue(resultObj);
    };
    const renderForm = (func_name: string, inputArr: [], idx: number) => {
        // console.log('inputArr', inputArr);
        const resetBtnClass = inputArr.length > 0 ? 'reset-btn-visible' : 'reset-btn-hidden';
        const fieldNameArr: string[] = [];
        return <>
            {
                inputArr.map((item: any, index) => {
                    fieldNameArr.push(idx + '-' + item.p_name); // fieldName与Form.Item的name保持一致，且必须带索引编号idx
                    return <Form.Item name={idx + '-' + item.p_name} label={item.p_name} key={idx + '-' + item.p_name + index} rules={[{ required: true }]} className='form-position-input'>
                        {item.p_type.indexOf('[') >= 0 ?
                        <TextArea placeholder={item.p_type} allowClear autoSize />
                        :
                        <Input placeholder={item.p_type} allowClear />
                        }
                    </Form.Item>
                })
            }
            <Form.Item {...tailLayout}>
                <Button data-fields={fieldNameArr.join(',')} className={resetBtnClass} onClick={onOneFormReset}>重置</Button>&nbsp;&nbsp;
                <Button
                    data-func_name={func_name} 
                    data-fields={fieldNameArr.join(',')} 
                    data-idx={idx} 
                    type="primary" onClick={onOneFormClick}
                >执行</Button>
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
                {renderForm(item.func_name, item.inputs, index)}
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


    let titleProject = '';
    (deptProjListFromServer.projListbyDept as any)[currDepartmentId]?.child.map((item: any) => {
        if (currProjectId === '') {
            // 刚打开时的默认值，什么也不做
        } else if (item.value === currDepartmentId) {
            titleProject = item.label;
        }
    });
    

    return <GridContent>
        <>
            {Object.keys(web3Onboard).length ? <section >
                <div className='user-info-basic'>
                    <div className='header-align-left'>
                        当前ABI： {titleProject} - {currEnv} - {titleInfo.contractName} - {titleInfo.version}
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
                    <div>合约部署地址： {currAddress}</div>
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
                            defaultValue="1"
                            style={{ width: '100%' }}
                            onChange={deptHandleChange}
                            value={currDepartmentId}
                            options={deptProjListFromServer.deptList}
                        />
                        <div className='search-condition-title'>项目：</div>
                        <Select
                            // defaultValue="all"
                            style={{ width: '100%' }}
                            onChange={projectHandleChange}
                            value={currProjectId}
                            options={(deptProjListFromServer.projListbyDept as any)[currDepartmentId]?.child}
                        />
                        <div className='search-condition-title'>环境：</div>
                        <Select
                            defaultValue="prod"
                            style={{ width: '100%' }}
                            onChange={envHandleChange}
                            value={currEnv}
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
                            treeData={treeDataSource}
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