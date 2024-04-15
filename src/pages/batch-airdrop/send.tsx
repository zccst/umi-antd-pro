import { ActionType, ProColumns } from '@ant-design/pro-components';
import { GridContent, ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Spin, Radio, Space, Select, Popconfirm, Tooltip, message, Tag, Upload } from 'antd';
import { EllipsisOutlined, PlusOutlined, MinusCircleOutlined, QuestionCircleOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import { Suspense, useState, useEffect, useRef } from 'react';
import { history, useModel, Link } from 'umi';
import request from '../../utils/req';
import { batchAirdropUrlPrefix, LOGINPATH, AIRDROP_TYPE_LIST } from '../../utils/constant'

import { getChains } from '@/services/ant-design-pro/api';

type AirdropItem = {
  id: number;
  name: string;
  csv_name: string;
  group_id: number;
  network_id: number;
  network_name: string;
  airdrop_type: string;
  coin_name: string;
  coin_type: string;
  erc20_id: number;
  address_count: number;
  address_list: object;
  max_address_num: number;
  airdrop_contract_id: number;
  airdrop_contract_name: string;
  status: number;
  create_user_id: number;
  create_user_name: string;
  tx_hash: string;
  create_time: string;
  update_time: string;
};

interface CollectionCreateFormProps {
  open: boolean;
  confirmLoading: boolean;
  extraObj: {[key: string]: any};
  onCreate: (type: string, values: AirdropItem) => void;
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

  const [currAirdropType, setCurrAirdropType] = useState('erc20_same_num');
  const title = "创建";

  const defaultV = {
    name: form.getFieldValue('name') || "",
    network_id: form.getFieldValue('network_id') || '',
    airdrop_type: form.getFieldValue('airdrop_type') || '',
    erc20_id: form.getFieldValue('erc20_id') || "",
    max_address_num: form.getFieldValue('max_address_num') || "",
    airdrop_contract_id: form.getFieldValue('airdrop_contract_id') || "",
  }
  // 只创建，不修改
  console.log('defaultV', extraObj, defaultV);

  setTimeout(() => {
    form.setFieldsValue(defaultV);
  }, 10);

  const onAirdropSelect = (airdrop_type: any) => {
    setCurrAirdropType(airdrop_type)
    form.setFieldsValue({airdrop_type: airdrop_type});
  }

  const onLocalCancel = () => {
    form.resetFields();
    onCancel();
  }

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }
  const beforeUpload = async (file: any) => {
    console.log('beforeUpload', file.name);
  };

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
            console.log('File对象' , values['csv'][0].originFileObj);
            const reader = new FileReader();
            reader.readAsText(values['csv'][0].originFileObj);
            reader.onload = () => {
              const cont = typeof reader.result === 'string' ? reader.result : reader.result?.toString()
              values['csv_name'] = values['csv'][0].originFileObj.name
              values['csv'] = cont
              onCreate(extraObj.type, values);
            };
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
        <Form.Item hidden={true} name="id"><Input /></Form.Item>
        <Form.Item hidden={true} name="create_time"><Input /></Form.Item>
        <Form.Item hidden={true} name="update_time"><Input /></Form.Item>

        <Form.Item
          name="name"
          label="空投名称"
          rules={[{ required: true, message: '请输入空投名称！' }]}
        >
          <Input placeholder="空投名称" />
        </Form.Item>
        <Form.Item 
          label="所属网络"
          name="network_id"
          rules={[{ required: true, message: '请选择所属网络！' }]}
        >
          <Select 
            disabled={(extraObj.type === 'edit') ? true : false}
            options={extraObj.chainFormOptions}
          >
          </Select>
        </Form.Item>
        <Form.Item 
          label="空投类型"
          name="airdrop_type"
          rules={[{ required: true, message: '请选择空投类型！' }]}
        >
          <Select 
            disabled={(extraObj.type === 'edit') ? true : false}
            options={AIRDROP_TYPE_LIST}
            onSelect={onAirdropSelect}
          >
          </Select>
        </Form.Item>

        {
          (currAirdropType === 'erc20_same_num' || currAirdropType === 'native_same_num')
          ? <Form.Item
              name="value_per_address"
              label="空投数量"
            >
              <Input placeholder="请输入空投数量！数量相同，需要填写；数量不同，则不需要填写" />
            </Form.Item>
          : null
        }

        {
          (currAirdropType === 'erc20_same_num' || currAirdropType === 'erc20_diff_num')
          ? <Form.Item 
              label="空投ERC20代币"
              name="erc20_id"
            >
              <Select 
                disabled={(extraObj.type === 'edit') ? true : false}
                options={extraObj.erc20FormOptions}
              >
              </Select>
            </Form.Item>
          : null
        }
        
        <Form.Item
          name="csv"
          label="csv文件"
          rules={[{ required: true, message: '请上传csv文件！' }]}
          valuePropName="fileList"
          getValueFromEvent={normFile}
          extra="如果上传多个keystore文件，以第一个为准"
        >
          <Upload name="content" action="/upload.do" beforeUpload={beforeUpload} listType="text">
            <Button icon={<UploadOutlined />}>点击上传</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          name="max_address_num"
          label="单笔交易最大地址数"
          rules={[{ required: true, message: '请输入单笔交易最大地址数！' }]}
        >
          <Input placeholder="请输入单笔交易最大地址数！" />
        </Form.Item>
        <Form.Item 
          label="选择空投合约"
          name="airdrop_contract_id"
          rules={[{ required: true, message: '请选择空投合约！' }]}
        >
          <Select 
            disabled={(extraObj.type === 'edit') ? true : false}
            options={extraObj.airdropContractFormOptions}
          >
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};



const SendAirdrop: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [messageApi, contextHolder] = message.useMessage();
  const { initialState } = useModel('@@initialState');

  const [open, setOpen] = useState(false);
  // const [modalItem, setModalItem] = useState<{[key: string]: any}>({});
  const [extraObj, setExtraObj] = useState({type: '', item: {}, chainFormOptions:[], erc20FormOptions: [], airdropContractFormOptions: []});
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [balanceArr, setBalanceArr] = useState([]);
  const [isBalanceSpinning, setIsBalanceSpinning] = useState(false);


  const [chainListFromServer, setChainListFromServer] = useState([]);
  const [erc20ListFromServer, setErc20ListFromServer] = useState([]);
  const [airdropContractListFromServer, setAirdropContractListFromServer] = useState([]);

    useEffect(() => {
      (async () => {
        const result = await getChains();
        let finalChain = [];
        if ( result.code === 0) {
          console.log('erc20 page getChains', result.data);
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

      // erc20 list
      request
        .get(batchAirdropUrlPrefix + "/erc20/list?current=1")
        .then(function(response) {
          if (response.code === 0) {
            const data = (response.data && response.data.list) ? response.data.list : [];
            const targetArr = data.map((item: any) => {
              return {
                value: '' + item.id,
                label: item.name,
              }
            });
            console.log('/erc20/list?current=1', targetArr);
            setErc20ListFromServer(targetArr);
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


      // airdrop contract list
      request
        .get(batchAirdropUrlPrefix + "/contract/list?current=1")
        .then(function(response) {
          if (response.code === 0) {
            const data = (response.data && response.data.list) ? response.data.list : [];
            const targetArr = data.map((item: any) => {
              return {
                value: '' + item.id,
                label: item.name,
              }
            });
            console.log('/contract/list?current=1', targetArr);
            setAirdropContractListFromServer(targetArr);
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



  const onCreate = (type: any, values: any) => {
    // console.log(initialState.currentUser);
    console.log('Received values of form: ', values);
    const urlObj: any = {
      'new': '/create',
      'edit': '/update',
    };
    const newParam = {
      name: values['name'],
      network_id: +values['network_id'],
      airdrop_type: values['airdrop_type'],
      erc20_id: +values['erc20_id'],
      value_per_address: +values['value_per_address'],
      csv: values['csv'],
      csv_name: values['csv_name'],
      max_address_num: +values['max_address_num'],
      airdrop_contract_id: +values['airdrop_contract_id'],
    }
    
    const param = newParam
    console.log(param, values);
    // return;
    setConfirmLoading(true);
    request.post(`${batchAirdropUrlPrefix}/task${urlObj[type]}`, {
      data: param,
    })
      .then(function(response) {
        if (response.code === 0) {
          messageApi.open({
            type: 'success',
            content: '提交成功！',
          });
          // window.location.reload();
          actionRef.current?.reload();
        } else if (response.code === 403) {
          //TODO
          message.error('登录已超时，请重新登录。');
          history.push(LOGINPATH);
        } else {
          messageApi.open({
            type: 'error',
            content: '提交失败，原因：' + response.msg,
          });
        }
        setOpen(false);
        setConfirmLoading(false);
      })
      .catch(function(error) {
        console.log(error);
        setConfirmLoading(false);
      });
  };

  const queryBalance = (key: React.Key) => {
    setIsBalanceModalOpen(true)
    setIsBalanceSpinning(true)
    request.get(`${batchAirdropUrlPrefix}/task/balance?id=${key}`)
      .then(function(response) {
        if (response.code === 0) {
          setBalanceArr(response.data)
          setIsBalanceSpinning(false)
        } else if (response.code === 403) {
          //TODO
          message.error('登录已超时，请重新登录。');
          history.push(LOGINPATH);
        } else {
          messageApi.open({
            type: 'error',
            content: '提交失败，原因：' + response.msg,
          });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  };
  const handleBalanceOk = () => {
    setIsBalanceModalOpen(false);
  };

  const handleBalanceCancel = () => {
    setIsBalanceModalOpen(false);
  };

  const handleDelete = (key: React.Key) => {
    console.log('handleDelete', key);
    request.post(`${batchAirdropUrlPrefix}/task/delete`, {
      data: { id : key},
    })
      .then(function(response) {
        if (response.code === 0) {
          messageApi.open({
            type: 'success',
            content: '提交成功！',
          });
          actionRef.current?.reload();
        } else if (response.code === 403) {
          //TODO
          message.error('登录已超时，请重新登录。');
          history.push(LOGINPATH);
        } else {
          messageApi.open({
            type: 'error',
            content: '提交失败，原因：' + response.msg,
          });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  };



  // 表格的列
  const columns: ProColumns<AirdropItem>[] = [
    {
      title: '分组编号',
      key: 'group_id',
      dataIndex: 'group_id',
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '空投网络',
      key: 'network_name',
      dataIndex: 'network_name',
      copyable: true,
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '空投类型',
      key: 'airdrop_type',
      dataIndex: 'airdrop_type',
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
      render: (text, record, _, action)=> {
        let retStr = ""
        AIRDROP_TYPE_LIST.map((item, index) => {
          if (item.value === record.airdrop_type) {
            retStr = item.label
          }
        })
        return retStr
      },
    },
    {
      title: '代币名称',
      key: 'coin_name',
      dataIndex: 'coin_name',
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '单笔交易最大地址数',
      key: 'max_address_num',
      dataIndex: 'max_address_num',
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
      render: (text, record, _, action)=> {
        return record.status ? '未发放' : '已发放'
      },
    },
    {
      title: '余额',
      key: 'balance',
      dataIndex: 'balance',
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
      render: (text, record, _, action)=> {
        const cont =  balanceArr.map((item: any) => {
          return item.network_name + ':' + item.balance + ';  '
        })
        return <Tooltip title={cont}>
          { cont.length ? <span>光标悬停查看</span> : null }
        </Tooltip>
      }
    },
    {
      title: '创建人',
      key: 'username',
      dataIndex: 'username',
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '创建时间',
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
        }}>
          发放
        </a>,
        <a key='checkStatus' onClick={() => {
        }}>
          查看状态
        </a>,
        <a key='edit' onClick={() => {
        }}>
          置位无效
        </a>,
        <Popconfirm key="delete" title="确定要删除吗" onConfirm={() => handleDelete(record.id)}>
          <a>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return <GridContent>
    <>
      {contextHolder}
      <ProTable<AirdropItem>
        columns={columns}
        actionRef={actionRef} // Table action 的引用，便于自定义触发
        cardBordered  // Table 和 Search 外围 Card 组件的边框
        request={async (params = {}, sort, filter) => {
          console.log('params', params, sort, filter);
          let ret: any = {};
          await request<{
            data: AirdropItem[];
          }>(`${batchAirdropUrlPrefix}/task/list`, {
            params,
          }).then(r => ret = r);

          console.log('ret', ret, typeof ret);

          if (ret.code === 403) {
            //TODO
            message.error('登录已超时，请重新登录。');
            history.push(LOGINPATH);
          } else if (ret.code !== 0) {
            messageApi.open({
              type: 'error',
              content: '获取链列表失败，原因：' + ret.msg,
            });
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
        search={false} // 是否显示搜索表单，false | SearchConfig 传入对象时为搜索表单的配置
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
        headerTitle="发空投列表"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              // actionRef.current?.reload();
              setOpen(true);
              setExtraObj({
                type: 'new',
                item: {},
                chainFormOptions: chainListFromServer,
                erc20FormOptions: erc20ListFromServer,
                airdropContractFormOptions: airdropContractListFromServer,
              });
            }}
            type="primary"
          >
            新建
          </Button>,
        ]}
      />

      <Modal title="查看余额" width={600} open={isBalanceModalOpen} onOk={handleBalanceOk} onCancel={handleBalanceCancel}>
        <Spin spinning={isBalanceSpinning} tip="因去各链请求需要一段时间，请耐心等待">
          <table>
            <tbody>
            {
              balanceArr.map((item: any, index) => {
                return <tr key={index}><td width={'30%'}>{item.network_name}</td><td width={'70%'}>{item.balance}</td></tr>
              })
            }
            </tbody>
          </table>
        </Spin>
      </Modal>

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
