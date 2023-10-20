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
import { Tree, Tabs, Collapse, Switch, Form, Input, Select, Button, Avatar, List, Col, Dropdown, Menu, Row, message, Alert, Tag, version } from 'antd';
const { Panel } = Collapse;
const { TextArea, Search } = Input;
import type { DataNode, TreeProps } from 'antd/es/tree';
import { DownOutlined, SearchOutlined, ReadOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Suspense, useState, useEffect } from 'react';
import { history, Link } from 'umi';

import ReactJson from 'react-json-view'

import request from '../../../utils/req';

import PageLoading from '../components/PageLoading';
import { shortenAddress } from '../../../utils/utils';
import { deptProjUrl, getProjListUrl, getAbiInfoUrl, LOGINPATH } from '../../../utils/constant'
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
    const [currDepartmentId, setCurrDepartmentId] = useState(''); // 没法默认
    const [currProjectId, setCurrProjectId] = useState('');
    const [currEnv, setCurrEnv] = useState('prod'); // 空表示全部
    const [loading, setLoading] = useState(false);

    // treeDate
    const [treeDataSource, setTreeDataSource] = useState([]);
    const [titleInfo, setTitleInfo] = useState({contractName: '', version: ''});
    // const [abiInfoFromServe, setAbiInfoFromServe] = useState({ abi: '', read_funcs: [], write_funcs: [], addrs: []});
    
    let [methodKey, setMethodKey] = useState(['']);
    let [methodList, setMethodList] = useState([{}]);
    let [addrList, setAddrList] = useState([{}]);
    let [abiJson, setAbiJson] = useState('');
    let [currAddress, setCurrAddress] = useState('');
    let [currChainId, setCurrChainId] = useState('');

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
              if (deptList.length) {
                setCurrDepartmentId(deptList[0].value);
                
                if (targetOptionObj[deptList[0].value].child.length) {
                    const tmpProId = targetOptionObj[deptList[0].value].child[0].value;
                    setCurrProjectId(tmpProId);
                    _doSearch({
                        dept_id: +deptList[0].value,
                        project_id: tmpProId,
                        env: currEnv
                    });
                }
              }
            } else if (response.code === 403) {
                //TODO
                message.error('登录已超时，请重新登录。');
                history.push(LOGINPATH);
            } else {
                message.error("获取部门列表失败，原因：" + response.msg);
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

        // 查看当前的链，与钱包中的链是否一致。如果不一致，则提示切换至与用户选择的链一致。
        const selectChainId = '0x' + currChainId;
        console.log('检查链是否一致', connectedChain?.id, selectChainId, connectedChain?.id !== selectChainId);
        if (connectedChain?.id !== selectChainId) {
            setChain({ chainId: selectChainId });
        }

        // 设置右侧address，如果是临时地址，则全部不再高亮。
        setCurrAddress(currAddress);
        const newList = addrList.map((item: any) => {
            return {
                ...item, 
                isActive: item.addr === currAddress ? true : false,
                isAvatarActive: item.addr === currAddress ? true : false,
            }
        });
        setAddrList(newList);

        // 还原合约
        // 合约地址，signer, provider
        const signer = provider.getUncheckedSigner();
        try {
            const contract = new ethers.Contract(currAddress, abiJson, signer);
            setCurrContract(contract);
        } catch (exception) {
            console.log('try catch', exception, typeof exception);
            alert(exception);
        }

        message.success("At Address地址 " + currAddress + " 成功");
    }
    const onChangeCurrAddress= (e: any) => {
        setCurrAddress(e.target.value);// TODO 判断临时地址。此处不再验证合法性。
    }

    const onAlertClose = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        console.log(e, 'I was closed.');
    };

    // 左侧 select查询
    const deptHandleChange = (value: string) => {
        setCurrDepartmentId(value);
        const projectArr = (deptProjListFromServer.projListbyDept as any)[value]?.child;
        projectArr.length ? setCurrProjectId(projectArr[0].value) : ''; //第0个元素
    };
    const projectHandleChange = (value: string) => {
        setCurrProjectId(value);
    };
    const envHandleChange = (value: string) => {
        setCurrEnv(value);
    };
    const _doSearch = (params: any) => {
        console.log(`search`, params);
        request
            .get(getProjListUrl, {
                params
            })
            .then(function(response) {
                // console.log(response);
                setLoading(false);
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
                } else if (response.code === 403) {
                    //TODO
                    message.error('登录已超时，请重新登录。');
                    history.push(LOGINPATH);
                } else {
                    message.error('查询失败，原因：' + response.msg);
                }
            })
            .catch(function(error) {
                console.log(error);
            });
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
        setLoading(true);
        _doSearch(params);
    };

    const onTreeSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        // console.log('selected', selectedKeys, info, treeDataSource);
        console.log('选中的树节点', selectedKeys);
        if (typeof selectedKeys[0] === 'number') {
            message.warning('请展开树节点，选择叶子节点对应的具体版本！');
            return false;
        }

        if (!selectedKeys.length) {
            message.warning('没有选中树节点，请先选择一个节点！');
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
            id: selectedVersionKey,
        }
        console.log(`abi/info`, params);
        // 发送请求
        request
            .get(getAbiInfoUrl, {
                params
            })
            .then(function(response) {
                // console.log(response);
                if (response.code === 0) {
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
                } else if (response.code === 403) {
                    //TODO
                    message.error('登录已超时，请重新登录。');
                    history.push(LOGINPATH);
                } else {
                    message.error('查询合约详情失败，原因：' + response.msg);
                }
            })
            .catch(function(error) {
                message.error('请求异常，原因：' + error.toString());
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
        let is_write = e.target.getAttribute('data-is_write');
        if (!func_name) {
            func_name = e.target.parentNode.getAttribute('data-func_name');
        }
        if (!strFields) {
            strFields = e.target.parentNode.getAttribute('data-fields');
        }
        if (!idx) {
            idx = e.target.parentNode.getAttribute('data-idx');
        }
        if (!is_write) {
            is_write = e.target.parentNode.getAttribute('data-is_write');
        }
        console.log('tryToGetNode', func_name, strFields, idx);
        return {
            func_name: func_name,
            strFields: strFields,
            idx: idx,
            is_write: is_write,
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
        // 检查钱包连接情况
        if (!wallet) {
            const walletSelected = await connect()
            if (!walletSelected) {
                message.warning("请先连接钱包，再调用。");
                return false
            }
        }

        // 检查非空地址
        if (!currAddress) {
            message.warning('请先从右侧Address中点击选中一个地址，再点击右上角‘At Address’蓝色按钮关联合约地址，成功后再来执行读写方法。');
            return false;
        }
        // 检查合约实例化 TODO
        if (Object.keys(currContract).length === 0) {
            message.warning('请先点击右上角“At Address”蓝色按钮关联合约地址，成功后再来执行读写方法。');
            return false;
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
        // 发请求
        console.log('before call contract:', oneFormInfo, paramsValue, currContract, allData);
        let resultString;
        try {
            const res = await (currContract as any)[oneFormInfo.func_name](...paramsValue);
            resultString = res.toString()
            if (oneFormInfo.is_write === '1') {
                resultString = JSON.stringify(res);
            }
            console.log('success call', res, resultString);
        } catch (Error) {
            resultString = Error;
            console.log('exception call', Error);
        }
        
        
        let resultObj: any = {};
        resultObj[oneFormInfo.idx + '-result'] = resultString;
        form.setFieldsValue(resultObj);
    };
    const renderForm = (func_name: string, inputArr: [], idx: number, isRead: boolean) => {
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
                    data-is_write={isRead ? 0 : 1}
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
                {renderForm(item.func_name, item.inputs, index, item.isRead)}
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
        const chainId = e.target.getAttribute('data-chain-id');
        setCurrAddress(completeAddr);
        setCurrChainId(chainId);
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
                chainId: item.chain_id,
                isActive: item.isActive,
                avatar: item.isAvatarActive ?  thumbtackActive : thumbtackDefault,
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
                        title={<a data-complete-addr={item.completeAddr} data-chain-id={item.chainId} onClick={onAddressClick}>{item.title}</a>}
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
        } else if (item.value === currProjectId) {
            titleProject = item.label;
        }
    });
    

    return <GridContent>
        <>
            {Object.keys(web3Onboard).length ? <section >
                <Alert
                    message="合约调用流程6步骤："
                    description="1.点击右上角‘连接钱包’按钮，并切换至目标网络 -> 2.在左侧，根据部门、项目和环境查询合约 -> 3. 点击树结构，选择目标合约和版本，渲染出中间的读写方法和右侧关联地址列表 -> 
                    4.点击右侧Address地址列表，选中一个地址（图钉📌会高亮） -> 5.点击‘At Address’按钮，完成地址关联 -> 6.开始使用中间的合约读写方法。"
                    type="info"
                    closable
                    showIcon
                    onClose={onAlertClose}
                    />
                <div className='user-info-basic'>
                    <div className='header-align-left'>
                        当前ABI： {titleProject} - {currEnv} - {titleInfo.contractName} - {titleInfo.version}
                    </div>
                    <div className='header-align-right'>
                        {!wallet && (
                        <Button style={{width: 102}}
                            onClick={async () => {
                            const walletsConnected = await connect()
                            console.log('connected wallets: ', walletsConnected)
                            }}
                        >
                            连接钱包
                        </Button>
                        )}
                        {wallet && (<Button style={{width: 102}}
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
                        {wallet && (
                        <div  className='header-align-right'>
                            <Input.Group compact>
                                <Input 
                                    placeholder="点击Address列表选择地址，或输入临时地址"
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
                    <Col span={5} {...topColResponsiveProps} style={{ borderRight: '1px solid #ffffff'}}>
                        <div className='search-condition-title'>部门：</div>
                        <Select
                            defaultValue=""
                            placeholder="请选择部门"
                            style={{ width: '100%' }}
                            onChange={deptHandleChange}
                            value={currDepartmentId}
                            options={deptProjListFromServer.deptList}
                        />
                        <div className='search-condition-title'>项目：</div>
                        <Select
                            // defaultValue="all"
                            placeholder="请选择项目"
                            style={{ width: '100%' }}
                            onChange={projectHandleChange}
                            value={currProjectId}
                            options={(deptProjListFromServer.projListbyDept as any)[currDepartmentId]?.child}
                        />
                        <div className='search-condition-title'>环境：</div>
                        <Select
                            defaultValue="prod"
                            placeholder="请选择环境"
                            style={{ width: '100%' }}
                            onChange={envHandleChange}
                            value={currEnv}
                            options={[
                                // { value: '', label: '全部' },
                                { value: 'prod', label: 'prod' },
                                { value: 'test', label: 'test' },
                            ]}
                        />
                        <div className='search-condition-title'>
                            <Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={onSearch}>查询</Button>
                        </div>
                        
                        <Tree
                            showLine
                            switcherIcon={<DownOutlined />}
                            defaultExpandedKeys={['0-0-0']}
                            onSelect={onTreeSelect}
                            treeData={treeDataSource}
                        />
                    </Col>
                    <Col span={11} {...topColResponsiveProps}  style={{ borderRight: '1px solid #ffffff'}}>
                        <div className='method-header'>
                            <div>合约读写方法：</div>
                            <div>
                                <span className='all-open-close'>全部展开/折叠</span>
                                <Switch checkedChildren="打开" unCheckedChildren="关闭" onChange={onSwitchChange} />
                            </div>
                        </div>
                        {
                            methodList && methodList[0] && !Object.keys(methodList[0]).length && <div className='method-empty'>Content is empty</div>
                        }
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