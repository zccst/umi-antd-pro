import { GridContent } from '@ant-design/pro-components';
import { Tree, Tabs, Collapse, Switch, Form, Input, Select, Button, Col, Dropdown, Menu, Row } from 'antd';
const { Panel } = Collapse;
const { TextArea } = Input;
import type { DataNode, TreeProps } from 'antd/es/tree';
import { DownOutlined, SearchOutlined, ReadOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Suspense, useState } from 'react';
import ReactJson from 'react-json-view'
import PageLoading from '../components/PageLoading';
import Wallet from './wallet';
import './index.css'
import { stringify } from 'querystring';

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

const Call: React.FC = () => {
    for( let i = 0; i <= 100; i++) {
        const [form] = Form.useForm();
        const 'form' + i = form;
    }
    const [form1] = Form.useForm();
    const [form2] = Form.useForm();
    const [form3] = Form.useForm();
    const [form4] = Form.useForm();
    const [form5] = Form.useForm();
    const [form6] = Form.useForm();
    const [form7] = Form.useForm();
    const [form8] = Form.useForm();
    const [form9] = Form.useForm();
    const [form10] = Form.useForm();
    const [form11] = Form.useForm();
    const [form12] = Form.useForm();
    const [form13] = Form.useForm();
    const [form14] = Form.useForm();
    const [form15] = Form.useForm();
    
    let [methodKey, setMethodKey] = useState(['']);
    let [methodList, setMethodList] = useState([{}]);
    let [addrList, setAddrList] = useState([{}]);
    let [abiJson, setAbiJson] = useState('');

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
    const onForm0Change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('input 0', e.target.value);
    };
    const onForm1Change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('input 1', e.target.value);
    };
    const onForm2Change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('input 2', e.target.value);
    };
    const onForm3Change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        console.log('input 3', e.target.value);
    };
    const onFinish = (values: any) => {
        console.log(values);
    };
    const onReset0 = () => {
        form0.resetFields();
    };
    const onReset1 = () => {
        form1.resetFields();
    };
    const onReset2 = () => {
        form2.resetFields();
    };
    const onReset3 = () => {
        form3.resetFields();
    };
    const onReset4 = () => {
        form4.resetFields();
    };
    const onReset5 = () => {
        form5.resetFields();
    };
    const onReset6 = () => {
        form6.resetFields();
    };
    const onReset7 = () => {
        form7.resetFields();
    };
    const onReset8 = () => {
        form8.resetFields();
    };
    const onReset9 = () => {
        form9.resetFields();
    };
    const onReset10 = () => {
        form10.resetFields();
    };
    const onReset11 = () => {
        form11.resetFields();
    };
    const onReset12 = () => {
        form12.resetFields();
    };
    const onReset13 = () => {
        form13.resetFields();
    };
    const onReset14 = () => {
        form14.resetFields();
    };
    const onReset15 = () => {
        form15.resetFields();
    };
    const renderForm = (inputArr: [], idx: number) => {
        console.log(inputArr);
        return <>
            <Form {...layout} form={eval(`form${idx}`)} name={`control-hooks-${idx}`} onFinish={onFinish}>
                {
                inputArr.map((item: any, index) => {
                    return <Form.Item name={idx + item.p_name + index} label={item.p_name}  rules={[{ required: true }]} className='form-position-input'>
                        {item.p_type.indexOf('[') >= 0 ?
                        <TextArea placeholder={item.p_type} allowClear />
                        :
                        <Input placeholder={item.p_type} allowClear />
                        }
                    </Form.Item>
                })
                }
                <Form.Item {...tailLayout}>
                    <Button htmlType="button" onClick={eval(`onReset${idx}`)}>重置</Button>&nbsp;&nbsp;
                    <Button type="primary" htmlType="submit">执行</Button>
                </Form.Item>
            </Form>
            <div className='form-position-result'></div>
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
            <></>
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
    // 全部方法 打开/关闭
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
    // 点击单个方法 打开/关闭
    const onMethodChange = (key: string | string[]) => {
        setMethodKey(key);console.log(key);
    };

    // 右侧 地址列表
    const renderAddrList = (addrs: any) => {
        return addrs[0].addr;
    }
    const renderAbiJson = (abi: any) => {
        return abi ? <ReactJson src={JSON.parse(abi)} /> : abi;
    }

    

    return <GridContent>
        <>
            <Wallet />
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
                        
                        <Collapse bordered={false} activeKey={methodKey} defaultActiveKey={methodKey} onChange={onMethodChange}>
                            {
                                methodList.map((item, index) => renderPanel(item, index))
                            }
                        </Collapse>
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