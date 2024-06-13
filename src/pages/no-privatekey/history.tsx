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

type TaskItem = {
  id: number;
  name: string;
  desc: number;
  contract_id: number;
  contract_address: string;
  contract_name: string;
  contract_abi: string;
  department_id: string;
  department_name: string;
  network_id: number;
  network_name: string;
  method_privilege_addr_id: number;
  method_privilege_addr: string;
  // contract_methods: { key?: string; label?: string }[];
  method_params: [];
  // privilege_methods: { [key: string]: unknown; };
  apply_user_id: number;
  apply_user_name: string;
  approval_info: [];
  approval_status: string;
  status: number;
  create_time: string;
  message: string;
  update_time: string;
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


  // show approve Modal
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [taskDetail, setTaskDetail] = useState<{[key: string]: any}>({});


  const [chainListFromServer, setChainListFromServer] = useState([]);
  const [approvalAddrListFromServer, setApprovalAddrListFromServer] = useState<{[key: string]: any}>({});

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

    // approval addr list
    request
      .get(noPrivateKeyUrlPrefix + "/approval_addr/list?current=1")
      .then(function(response) {
        if (response.code === 0) {
          const data = (response.data && response.data.list) ? response.data.list : [];
          const targetMap: any = {}
          data.map((item: any) => {
            const tmpObj = {
              id: '' + item.id,
              department_id: item.department_id,
              department_name: item.department_name,
              address: item.address,
              user_name: item.user_name,
              user_id: item.user_id,
            }
            targetMap[item.department_name] ? targetMap[item.department_name].push(tmpObj) 
            : targetMap[item.department_name] = [tmpObj]
          });
          // console.log('/contract/list?current=1', targetArr);
          setApprovalAddrListFromServer(targetMap);
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



  // 通过审批
  const showDetailModal = (info: any) => {
    setOpen(true)
    setTaskDetail(info)
    console.log('showDetailModal', info);
  }

  const onCancel = () => {
    setOpen(false)
  }

  // 表格的列
  const columns: ProColumns<TaskItem>[] = [
    {
      title: '查询类型',
      key: 'type',
      dataIndex: 'type',
      hideInTable: true, // 在 Table 中不展示此列
      renderFormItem: (item, { type, defaultRender }, form) => {
        return <Select 
          defaultValue={'my_task'}
          options={[{ label: '我发起的', value: 'my_task'}, { label: '待审批', value: 'my_under_approve'} ]}
        >
        </Select>
      },
    },
    {
      title: '任务名称',
      key: 'name',
      dataIndex: 'name',
      // copyable: true,
      ellipsis: true,
      render:  (data, record, _)=> {
        const desc = record.desc ? '(' + record.desc + ')': ''
        return <span>{record.name}{desc}</span>;
      }
    },
    {
      title: '合约地址',
      key: 'contract_address',
      dataIndex: 'contract_address',
      ellipsis: true,
      copyable: true,
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
      title: '合约方法名',
      key: 'method_name',
      dataIndex: 'method_name',
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '特权地址',
      key: 'method_privilege_addr',
      dataIndex: 'method_privilege_addr',
      ellipsis: true,
      copyable: true,
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '申请人',
      key: 'apply_user_name',
      dataIndex: 'apply_user_name',
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '审批状态',
      key: 'approval_status',
      dataIndex: 'approval_status',
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '任务状态',
      key: 'status',
      dataIndex: 'status',
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
      render: (text, record, _, action)=> {
        const statusArr = ['', '未审批', '审批中', '已通过', '已拒绝', '已终止', '已广播', '广播失败']
        return statusArr[record.status]
      },
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
        <a key='detail' onClick={() => {
          showDetailModal(record)
        }}>
          详情
        </a>
      ],
    },
  ];

  return <GridContent>
    <>
      <ProTable<TaskItem>
        columns={columns}
        actionRef={actionRef} // Table action 的引用，便于自定义触发
        cardBordered  // Table 和 Search 外围 Card 组件的边框
        request={async (params = {}, sort, filter) => {
          console.log('params', params, sort, filter);
          // 默认使用我的任务列表
          !params['type'] ? params['type'] = 'all' : ''
          let ret: any = {};
          await request<{
            data: TaskItem[];
          }>(`${noPrivateKeyUrlPrefix}/contract_task/list`, {
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
        headerTitle="合约列表"
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
          //       approvalAddrFormOptions: approvalAddrListFromServer,
          //     });
          //   }}
          //   type="primary"
          // >
          //   新建
          // </Button>,
        ]}
      />

      <Modal 
        title={"查看详情"} 
        width={660} 
        open={open} 
        onOk={onCancel} 
        onCancel={onCancel}
      >
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 19 }}
          name="form_in_modal"
          // initialValues={defaultV}
        >
          
          <table width="100%" border={0} cellSpacing={0} cellPadding={2}>
            <tbody>
              <tr><td>合约名称</td><td>{taskDetail['contract_name']}</td></tr>
              <tr><td>合约地址</td><td>{taskDetail['contract_address']}</td></tr>
              <tr><td>所属链</td><td>{taskDetail['network_name']}</td></tr>
              <tr><td>所属部门</td><td>{taskDetail['department_name']}</td></tr>
              <tr><td>任务ID</td><td><strong>{taskDetail['uuid']}</strong></td></tr>
              <tr><td>任务名称</td><td>{taskDetail['name']}</td></tr>
              <tr><td>最后更新</td><td>{taskDetail['update_time']}</td></tr>
              <tr><td></td><td style={{ visibility: 'hidden'}}>.</td></tr>
              <tr><td>特权方法</td><td>{taskDetail['method_name']}</td></tr>
              <tr><td>特权地址</td><td>{taskDetail['method_privilege_addr']}</td></tr>
              <tr><td>参数列表</td><td>{taskDetail['method_param'] 
                && taskDetail['method_param'].length 
                && taskDetail['method_param'].map((item: any, index: any) => {
                return <div key={index}>'{item.key}': {item.value}</div>
              })}</td></tr>
              <tr><td></td><td style={{ visibility: 'hidden'}}>.</td></tr>
              <tr><td>审批状态</td><td>{taskDetail['approval_status']}</td></tr>
              <tr><td>审批详情</td><td>{taskDetail['approval_info']
                && taskDetail['approval_info'].length
                && taskDetail['approval_info'].map((item: any, index: any) => {
                return <div key={index}>{item.status === 1 ? '未审批' : (item.status === 2 ? '已通过(' + item.sign_time + ')' : '已拒绝(' + item.sign_time + ',' + item.message + ')')} - {item.name}</div>
              })}</td></tr>
              <tr><td></td><td style={{ visibility: 'hidden'}}>.</td></tr>
              <tr><td>gas_limit</td><td>{taskDetail['gas_limit']}</td></tr>
              <tr><td>上链状态</td><td>{taskDetail['message'] ? taskDetail['message'] : '暂无'}</td></tr>
            </tbody>
          </table>

        </Form>
      </Modal>

      
    </>
  </GridContent>;
};


export default SendAirdrop;
