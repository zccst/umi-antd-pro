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
import { Tree, Tabs, Collapse, Switch, Form, Input, Select, Button, Avatar, List, Col, Dropdown, Menu, Row, message, version } from 'antd';
const { Panel } = Collapse;
const { TextArea, Search } = Input;
import type { DataNode, TreeProps } from 'antd/es/tree';
import { DownOutlined, SearchOutlined, ReadOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Suspense, useState, useEffect } from 'react';
import ReactJson from 'react-json-view'

import request from 'umi-request';

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
    const [{ wallet }, connect, disconnect] = useConnectWallet()
    const connectedWallets = useWallets()
    const [web3Onboard, setWeb3Onboard] = useState<{[key: string]: any}>({});

    const [form] = Form.useForm();
    
    

    // 部门project列表，从服务端获取
    const [deptProjListFromServer, setDeptProjListFromServer] = useState({deptList: [], projListbyDept: {}});
    const [currDepartmentId, setCurrDepartmentId] = useState('2'); // 默认NFT
    const [currProjectId, setCurrProjectId] = useState('');
    const [currEnv, setCurrEnv] = useState('prod');

    // treeDate
    const [treeDataSource, setTreeDataSource] = useState([]);
    // const [abiInfoFromServe, setAbiInfoFromServe] = useState({ abi: '', read_funcs: [], write_funcs: [], addrs: []});
    
    let [methodKey, setMethodKey] = useState(['']);
    let [methodList, setMethodList] = useState([{}]);
    let [addrList, setAddrList] = useState([{}]);
    let [abiJson, setAbiJson] = useState('');
    let [currAddress, setCurrAddress] = useState('');


    useEffect(() => {
        setWeb3Onboard(initWeb3Onboard);
        // console.log('setWeb3Onboard(initWeb3Onboard)', web3Onboard); web3Onboard为什么是空对象
        // web3Onboard && web3Onboard.state && web3Onboard.state.actions.updateAccountCenter({
        //     minimal: false
        // })
        return () => {
            // 处理已登录的面板
            console.log('updateAccountCenter({minimal: true})');
            // setWeb3Onboard({})
            // web3Onboard && web3Onboard.state && web3Onboard.state.actions.updateAccountCenter({
            //     minimal: true
            // })
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
                            title: item.name + '[' + (item.updatable ? '可升级' : '不可升级') + ']',
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
    // 左侧 树-数据源
    // const treeData: DataNode[] = [
    //     {
    //       title: 'parent 1',
    //       key: '0-0',
    //       children: [
    //         {
    //           title: 'parent 1-0',
    //           key: '0-0-0',
    //           children: [
    //             {
    //               title: 'leaf',
    //               key: '0-0-0-0',
    //             },
    //             {
    //               title: 'leaf',
    //               key: '0-0-0-1',
    //             },
    //             {
    //               title: 'leaf',
    //               key: '0-0-0-2',
    //             },
    //           ],
    //         },
    //         {
    //           title: 'parent 1-1',
    //           key: '0-0-1',
    //           children: [
    //             {
    //               title: 'leaf',
    //               key: '0-0-1-0',
    //             },
    //           ],
    //         },
    //         {
    //           title: 'parent 1-2',
    //           key: '0-0-2',
    //           children: [
    //             {
    //               title: 'leaf',
    //               key: '0-0-2-0',
    //             },
    //             {
    //               title: 'leaf',
    //               key: '0-0-2-1',
    //             },
    //           ],
    //         },
    //       ],
    //     },
    // ];
    const onTreeSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
        if (!selectedKeys.length) {
            message.warning('没有选中树节点，请先选择节点！');
            return false;
        }
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
        let paramObj: any = {};
        let prefix_index = 0;
        if (strFields) {
            const arrFileds = strFields.split(',');
            const allData = form.getFieldsValue();
            arrFileds.map((item: any, index: number) => {
                prefix_index = item.split('-')[0];
                paramObj[item.split('-')[1]] = allData[item];
            });
        }
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