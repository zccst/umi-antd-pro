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
} from '../contract/call/services'
import '../contract/call/wallet-customized.css'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers'

import { ActionType, ProColumns } from '@ant-design/pro-components';
import { GridContent, ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Spin, Radio, Space, Select, Popconfirm, Tooltip, message, Alert, Tag, Upload } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { EllipsisOutlined, PlusOutlined, MinusCircleOutlined, QuestionCircleOutlined, SearchOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import { Suspense, useState, useEffect, useRef } from 'react';
import { history, useModel, Link } from 'umi';
import request from '../../utils/req';
import { noPrivateKeyUrlPrefix, LOGINPATH } from '../../utils/constant'

import { getChains } from '@/services/ant-design-pro/api';

type ContractItem = {
  id: number;
  name: string;
  address: string;
  desc: number;
  network_id: number;
  network_name: string;
  department_id: string;
  department_name: string;
  deployed_time: string;
  abi: string;
  // contract_methods: { key?: string; label?: string }[];
  contract_methods: [];
  privilege_methods: { [key: string]: unknown; };
  status: number;
  create_time: string;
  update_time: string;
};

interface CollectionCreateFormProps {
  open: boolean;
  confirmLoading: boolean;
  extraObj: {[key: string]: any};
  onCreate: (type: string, values: ContractItem) => void;
  onCancel: () => void;
}


const CollectionCreateForm: React.FC<CollectionCreateFormProps> = ({
  open,
  confirmLoading,
  extraObj,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [currMethod, setCurrMethod] = useState('');
  const [currInputs, setCurrInputs] = useState([]);

  const title = "创建任务";

  const onMethodChange = (e: RadioChangeEvent) => {
    const selectedMethod = e.target.value
    console.log('radio checked', selectedMethod);
    setCurrMethod(selectedMethod);
    const methodList = extraObj.item.abi ? JSON.parse(extraObj.item.abi) : []
    for ( let i = 0; i < methodList.length; i++) {
      if (methodList[i].name === selectedMethod) {
        setCurrInputs(methodList[i].inputs)
      }
    }
    const tmpM = extraObj.item.privilege_methods
    form.setFieldsValue({last_use: tmpM[currMethod] ? tmpM[currMethod] : "截止目前，尚未使用过特权地址"})
  }

  const defaultV = {
    contract_id: extraObj.item.id || "",
    name: extraObj.item.name || "",
    address: extraObj.item.address || '',
    network_id: extraObj.item.network_id || '',
    network_name: extraObj.item.network_name || '',
    department_id: extraObj.item.department_id || '',
    department_name: extraObj.item.department_name || '',
    abi: extraObj.item.abi || '',
    _name: form.getFieldValue('_name') || '',
    _method: currMethod // 完美解决 默认值的问题
  }

  // 两重筛选：部门 && 网络
  const privilegeAddrOptions = []
  for (let i = 0; i < extraObj.privilegeAddrFormOptions.length; i++) {
    for (let j = 0; j < extraObj.privilegeAddrFormOptions[i].networks.length; j++) {
      if (extraObj.privilegeAddrFormOptions[i].deaprtment_name === extraObj.item.network_name
        && extraObj.privilegeAddrFormOptions[i].networks[j].network_name === extraObj.item.network_name) {
        privilegeAddrOptions.push({
          value: extraObj.privilegeAddrFormOptions[i].value,
          label: extraObj.privilegeAddrFormOptions[i].address + "(" 
            + extraObj.privilegeAddrFormOptions[i].poc + "," 
            + extraObj.privilegeAddrFormOptions[i].desc + ")",
        })
      }
    }
  }
  
  // 只创建，不修改 [currMethod]
  console.log('defaultV', currInputs, currMethod);

  setTimeout(() => {
    form.setFieldsValue(defaultV);
  }, 10);

  const onLocalCancel = () => {
    form.resetFields();
    onCancel();
  }

  return (
    <Modal
      open={open}
      confirmLoading={confirmLoading}
      title={title}
      width={800}
      onCancel={onLocalCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(extraObj.type, values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 17 }}
        name="form_in_modal"
        // initialValues={defaultV}
      >
        <Form.Item hidden={true} name="contract_id"><Input /></Form.Item>
        <Form.Item hidden={true} name="department_id"><Input /></Form.Item>
        <Form.Item hidden={true} name="network_id"><Input /></Form.Item>
        <Form.Item hidden={true} name="create_time"><Input /></Form.Item>
        <Form.Item hidden={true} name="update_time"><Input /></Form.Item>
        <Form.Item hidden={true} name="abi"><Input /></Form.Item>

        <Form.Item
          name="name"
          label="合约名称"
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="address"
          label="合约地址"
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="network_name"
          label="所属链"
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="department_name"
          label="所属部门"
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="_name"
          label="任务名称"
          rules={[{ required: true, message: '请输入任务名称！' }]}
        >
          <Input placeholder="任务名称" />
        </Form.Item>
        <Form.Item
          name="_method"
          label="选择特权方法"
          rules={[{ required: true, message: '请选择一个特权方法再提交!' }]}
        >
          <Radio.Group onChange={onMethodChange} value={currMethod}>
            <Space direction="vertical">
              {
                extraObj.item && extraObj.item.privilege_methods &&
                Object.keys(extraObj.item.privilege_methods).map((method, index) => {
                  return <Radio key={index} value={method}>{method}</Radio>
                })
              }
              <Radio key="upgradeTo" value="upgradeTo">upgradeTo(fake)</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="参数填写"
        >
        {
          currInputs.map((item: any, idx) => {
            return <Form.Item name={currMethod + '-' + item.name} label={item.name} key={idx + '-' + item.name} rules={[{ required: true }]} className='form-position-input'>
                {item.type.indexOf('[') >= 0 ?
                <TextArea placeholder={item.type} allowClear autoSize />
                :
                <Input placeholder={item.type} allowClear />
                }
            </Form.Item>
          })
        }
        </Form.Item>

        <Form.Item
          name="last_use"
          label="上次使用的特权地址"
        >
          <Input disabled />
        </Form.Item>
        <Form.Item 
          label="指定本次特权地址"
          name="_privilege_addr_id"
          rules={[{ required: true, message: '请选择特权地址！' }]}
        >
          <Select 
            disabled={(extraObj.type === 'edit') ? true : false}
            options={privilegeAddrOptions}
          >
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

let provider : any

const SendAirdrop: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const { initialState } = useModel('@@initialState');


  const [{ wallet }, connect, disconnect] = useConnectWallet(); // 钱包
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain(); // 链
  const [notifications, customNotification, updateNotify] = useNotifications(); // 通知
  const connectedWallets = useWallets(); // 已连接钱包，是数组
  const updateAccountCenter = useAccountCenter(); // 用户中心
  const [web3Onboard, setWeb3Onboard] = useState<{[key: string]: any}>({});


  const [open, setOpen] = useState(false);
  // const [modalItem, setModalItem] = useState<{[key: string]: any}>({});
  const [extraObj, setExtraObj] = useState({type: '', item: {}, chainFormOptions:[], privilegeAddrFormOptions: [], currUserDeptName: ''});
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [chainListFromServer, setChainListFromServer] = useState([]);
  const [privilegeAddrListFromServer, setPrivilegeAddrListFromServer] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await getChains();
      let finalChain = [];
      if ( result.code === 0) {
        // console.log('erc20 page getChains', result.data);
        finalChain = result.data.map((item: any) => {
          return {
            chain_id: item.chain_id,
            id: item.id,
            token: item.token,
            label: item.name,
            value: item.id,
            rpcUrl: item.rpc,
          }
        });
      }
      setChainListFromServer(finalChain)
    })()

    // privilege addr list
    request
      .get(noPrivateKeyUrlPrefix + "/privilege_addr/list?current=1")
      .then(function(response) {
        if (response.code === 0) {
          const data = (response.data && response.data.list) ? response.data.list : [];
          const targetArr = data.map((item: any) => {
            return {
              value: '' + item.id,
              address: item.address,
              desc: item.desc,
              department_id: item.department_id,
              department_name: item.department_name,
              networks: item.networks,
              poc: item.poc,
            }
          });
          // console.log('/erc20/list?current=1', targetArr);
          setPrivilegeAddrListFromServer(targetArr);
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


  const onCreate = async(type: any, values: any) => {
    // console.log(initialState.currentUser);
    console.log('Received values of form: ', type, values);
    const urlObj: any = {
      'new': '/create',
      'edit': '/update',
    };
    const onChainParamValues: any = [] // 根据etherjs手册，是一个参数数组
    const contractParams = Object.keys(values).map((item: any, idx: any) => {
      const fieldNameArr = item.split('-')
      if (fieldNameArr[0] === values['_method']) {
        onChainParamValues.push(values[item])
        return { key: fieldNameArr[1], value: values[item] }
      }
    }).filter(Boolean)

    const newParam: any = {
      name: values['_name'],
      contract_id: +values['contract_id'],
      method: values['_method'],
      privilege_addr_id: +values['_privilege_addr_id'],
      params: contractParams,
    }

    
    try {
      const abi = values['abi']
      const contractInterface = new ethers.utils.Interface(JSON.parse(abi));
      console.log('contractInterface', contractInterface, values['_method'], onChainParamValues);
      newParam['calldata'] = contractInterface.encodeFunctionData(values['_method'], onChainParamValues);
      
      console.log(newParam, values);
      // return false;
      setConfirmLoading(true);
      request.post(`${noPrivateKeyUrlPrefix}/contract_task${urlObj[type]}`, {
        data: newParam,
      })
        .then(function(response) {
          if (response.code === 0) {
            message.success('提交成功！')
            history.push('/no-privatekey/mytaskapproval');
          } else if (response.code === 403) {
            //TODO
            message.error('登录已超时，请重新登录。');
            history.push(LOGINPATH);
          } else {
            message.error('提交失败，原因：' + response.msg)
          }
          setOpen(false);
          setConfirmLoading(false);
        })
        .catch(function(error) {
          console.log(error);
          setConfirmLoading(false);
        });
    } catch (error) {
      message.error(JSON.stringify(error))
      setConfirmLoading(false)
    }

    
  };


  const onAlertClose = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log(e, 'I was closed.');
  };


  // 表格的列
  const columns: ProColumns<ContractItem>[] = [
    {
      title: '所属部门',
      key: 'department_id',
      dataIndex: 'department_id',
      hideInSearch: true, // 在查询表单中不展示此项
      render:  (data, record, _)=> {
        return <span>{record.department_name}</span>;
      }
    },
    {
      title: '合约名称',
      key: 'name',
      dataIndex: 'name',
      // copyable: true,
      ellipsis: true,
    },
    {
      title: '合约地址',
      key: 'address',
      dataIndex: 'address',
      ellipsis: true,
      copyable: true,
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '所属链',
      key: 'network_id',
      dataIndex: 'network_id',
      ellipsis: true,
      renderFormItem: (item, { type, defaultRender }, form) => {
        return <Select 
          options={chainListFromServer}
        >
        </Select>
      },
      render:  (data, record, _)=> {
        return <span>{record.network_name}</span>;
      }
    },
    {
      title: '部署时间',
      key: 'deployed_time',
      dataIndex: 'deployed_time',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '特权方法(特权地址)',
      key: 'privilege_methods',
      dataIndex: 'privilege_methods',
      hideInSearch: true, // 在查询表单中不展示此项
      ellipsis: true,
      render: (text, record, _, action)=> {
        const r: any = []
        Object.keys(record.privilege_methods).map((method, index) => {
          r.push(method + ', ' + record.privilege_methods[method])
        })
        return r.join("\r\n")
      },
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
      render: (text, record, _, action)=> {
        const statusArr = ['', '正常', '已废弃', '已删除']
        return statusArr[record.status]
      },
    },
    {
      title: '最后修改时间',
      key: 'update_time',
      dataIndex: 'update_time',
      valueType: 'date',
      sorter: true,
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '最后修改时间',
      dataIndex: 'update_time',
      valueType: 'dateRange',
      hideInSearch: true, // 在查询表单中不展示此项
      hideInTable: true, // 在 Table 中不展示此列
      search: { // 配置列的搜索相关，false 为隐藏
        // 转化值的 key, 一般用于时间区间的转化
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => [
        <a key='send' onClick={() => {
          console.log('record', record);
          setOpen(true);
          console.log(privilegeAddrListFromServer);
          setExtraObj({
            type: 'new',
            item: record,
            chainFormOptions: chainListFromServer,
            privilegeAddrFormOptions: privilegeAddrListFromServer,
            currUserDeptName: initialState.currentUser.depts[0].name,
          });
        }}>
          发起任务
        </a>,
      ],
    },
  ];

  return <GridContent>
    <>
      {Object.keys(web3Onboard).length ? <section >
          <Alert
              message="发起任务："
              description="1.从列表中找到合约 -> 2.点击发起任务 -> 3.填写特权方法参数，指定特权地址 -> 4.提交，如果您同时是审批人，则进行签名确认（点击右侧偏上“连接钱包”按钮）"
              type="info"
              closable
              showIcon
              onClose={onAlertClose}
              /> <br />
          <div className='user-info-basic' style={{ display: 'none'}}>
              <div className='header-align-left'></div>
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
      </section>
      :
      <div>Loading...</div>
      }
      <ProTable<ContractItem>
        columns={columns}
        actionRef={actionRef} // Table action 的引用，便于自定义触发
        cardBordered  // Table 和 Search 外围 Card 组件的边框
        request={async (params = {}, sort, filter) => {
          console.log('params', params, sort, filter);
          let ret: any = {};
          await request<{
            data: ContractItem[];
          }>(`${noPrivateKeyUrlPrefix}/contract/list`, {
            params,
          }).then(r => ret = r);

          // console.log('ret', ret, typeof ret);

          if (ret.code === 403) {
            //TODO
            message.error('登录已超时，请重新登录。');
            history.push(LOGINPATH);
          } else if (ret.code !== 0) {
            message.error('获取链列表失败，原因：' + ret.msg)
            return Promise.resolve({
              data: [],
              success: false,
              total: 0,
            });
          }

          const res = {
            data: ret.data.list || [],
            // success 请返回 true，
            // 不然 table 会停止解析数据，即使有数据
            success: ret.code === 0 ? true: false,
            // 不传会使用 data 的长度，如果是分页一定要传
            total: ret.data.total,
          }

          return Promise.resolve(res);
        }}
        editable={{
          type: 'multiple',
        }}
        columnsState={{ // 受控的列状态，可以操作显示隐藏
          persistenceKey: 'pro-table-singe-demos',
          persistenceType: 'localStorage',
          onChange(value) {
            // console.log('columnsState onChange value: ', value);
          },
        }}
        rowKey="id"
        search={{ // 是否显示搜索表单，传入对象时为搜索表单的配置
          labelWidth: 'auto', // 标签的宽度 'number' | 'auto'
          // collapsed: false, // 默认展开状态并去掉"收起"选项
          // collapseRender:() => null
          optionRender: ({ searchText }, { form }) => {
            // console.log(searchConfig, formProps, dom)
            return [
              <Button
                key="search"
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {
                  form?.submit();
                }}
              >
                {searchText}
              </Button>,
            ];
          },
        }} // 是否显示搜索表单，false | SearchConfig 传入对象时为搜索表单的配置
        options={{ // table 工具栏，设为 false 时不显示.传入 function 会点击时触发
          setting: {
            listsHeight: 400,
          },
        }}
        form={{
          // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
          syncToUrl: (values, type) => {
            // console.log('form', values, type);
            if (type === 'get') {
              console.log('form + get', values, type);
              return {
                ...values,
                created_at: [values.startTime, values.endTime],
              };
            }
            // console.log('form + created_at', values, type);
            return values;
          },
        }}
        pagination={{
          pageSize: 10,
          onChange: (page) => console.log(page),
        }}
        dateFormatter="string"
        headerTitle="我所在部门的合约列表"
        toolBarRender={() => [
          // <Button
          //   key="button"
          //   icon={<PlusOutlined />}
          //   onClick={() => {
          //     // actionRef.current?.reload();
          //     setOpen(true);
          //     setExtraObj({
          //       type: 'new',
          //       item: {},
          //       chainFormOptions: chainListFromServer,
          //       privilegeAddrFormOptions: privilegeAddrListFromServer,
          //     });
          //   }}
          //   type="primary"
          // >
          //   新建
          // </Button>,
        ]}
      />

      <CollectionCreateForm
        open={open}
        confirmLoading={confirmLoading}
        extraObj={extraObj}
        onCreate={onCreate}
        onCancel={() => {
          setOpen(false);
        }}
      />

    </>
  </GridContent>;
};


export default SendAirdrop;
