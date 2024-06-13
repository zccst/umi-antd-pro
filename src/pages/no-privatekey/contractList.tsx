import { ActionType, ProColumns } from '@ant-design/pro-components';
import { GridContent, ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Transfer, DatePicker, Form, Input, Modal, Radio, Space, Select, Popconfirm, Tooltip, message, Tag } from 'antd';
import { EllipsisOutlined, PlusOutlined, MinusCircleOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import type { TransferDirection } from 'antd/es/transfer';
import { Suspense, useState, useEffect, useRef } from 'react';
import { history, Link } from 'umi';
import request from '../../utils/req';
import { noPrivateKeyUrlPrefix, deptProjUrl, LOGINPATH, AIRDROP_TYPE_LIST } from '../../utils/constant'
import { getChains } from '@/services/ant-design-pro/api';
import moment from 'moment';

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

// 穿梭框
interface RecordType {
  key: string;
  title: string;
  description: string;
}


const queryURLObj: any = new URLSearchParams(window.location.search);
const defaultDeptId = queryURLObj.get("department_id") || '';



const CollectionCreateForm: React.FC<CollectionCreateFormProps> = ({
  open,
  confirmLoading,
  extraObj,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const title = extraObj.type === 'edit' ? "编辑 ( ID=" + extraObj.item.id + " )" : "创建";

  const defaultV = (extraObj.type === 'edit') ? { // 'edit'
    ...extraObj.item,
    department_id: '' + extraObj.item.department_id,
    network_id: '' + extraObj.item.network_id,
    deployed_time: moment(extraObj.item.deployed_time),
  } : {
    network_id: extraObj.chainFormOptions.length ? extraObj.chainFormOptions[0]['value'] : '',
    department_id: extraObj.deptFormOptions.length ? extraObj.deptFormOptions[0]['value'] : '',
    address: '',
    name: '',
    abi: '',
  }
  // extraObj.chainFormOptions[0]是全部
  // console.log('defaultV', extraObj, defaultV);
  
  setTimeout(() => {
    form.setFieldsValue(defaultV);
  }, 10);

  const onLocalCancel = () => {
    form.resetFields();
    onCancel();
  }

  const config = {
    rules: [{ type: 'object' as const, required: true, message: '请输入部署时间!' }],
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
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 19 }}
        name="form_in_modal"
        // initialValues={defaultV}
      >
        <Form.Item hidden={true} name="id"><Input /></Form.Item>
        <Form.Item hidden={true} name="create_time"><Input /></Form.Item>
        <Form.Item hidden={true} name="update_time"><Input /></Form.Item>
        <Form.Item 
          label="所属部门"
          name="department_id"
          rules={[{ required: true, message: '请选择所属部门！' }]}
        >
          <Select 
            disabled={(extraObj.type === 'edit') ? true : false}
            options={extraObj.deptFormOptions}
          >
          </Select>
        </Form.Item>
        <Form.Item
          name="address"
          label="合约地址"
          rules={[{ required: true, message: '请输入合约地址！' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="name"
          label="合约名称"
          rules={[{ required: true, message: '请输入空投合约名称！' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item 
          label="所属链"
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
          name="deployed_time" label="部署时间" {...config}>
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>
        <Form.Item
          name="abi"
          label="ABI"
          rules={[{ required: true, message: '请输入合约ABI！' }]}
        >
          <TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};



const CONTRACT: React.FC = () => {
    const actionRef = useRef<ActionType>();

    // 弹窗1：新增/编辑
    const [open, setOpen] = useState(false);
    // const [modalItem, setModalItem] = useState<{[key: string]: any}>({});
    const [extraObj, setExtraObj] = useState({type: '', item: {}, chainFormOptions:[], deptFormOptions:[]});
    const [confirmLoading, setConfirmLoading] = useState(false);

    // 弹窗2：增减特权方法
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currId, setCurrId] = useState(0);
    const [modalLoading, setModalLoading] = useState(false);
    const [methodList, setMethodList] = useState<RecordType[]>([]);
    const [targetKeys, setTargetKeys] = useState<string[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    // 部门project列表，从服务端获取
    const [deptListFromServer, setDeptListFromServer] = useState([]);
    // 当前department
    const [currDepartmentId, setDepartmentId] = useState(defaultDeptId);
    const onDepartmentSelect = (selected: any) => {
      setDepartmentId(selected);
    }

    const [chainListFromServer, setChainListFromServer] = useState([]);

    useEffect(() => {
      (async () => {
        const result = await getChains();
        let finalChain = [];
        if ( result.code === 0) {
          console.log('airdrop contract page getChains', result.data);
          finalChain = result.data.map((item: any) => {
            return {
              chain_id: item.chain_id,
              id: item.id,
              token: item.token,
              label: item.name,
              value: '' + item.id,
              rpcUrl: item.rpc,
            }
          });
        }
        setChainListFromServer(finalChain)
      })()
    }, []);

    useEffect(() => {
      request
        .get(deptProjUrl)
        .then(function(response) {
          if (response.code === 0) {
            const data = response.data;
            const targetArr = data.map((item: any) => {
              return {
                value: '' + item.dept_id,
                label: item.dept_name,
              }
            });
            setDeptListFromServer(targetArr);
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

    // 弹窗2：增减特权方法
    const showModal = (item: any) => {
      const abiArr = JSON.parse(item.abi)
      const writeArr = abiArr && abiArr.length && abiArr.map((obj: any) => {
        if (obj.type === "function" && (obj.stateMutability === "nonpayable" || obj.stateMutability === "payable")) {
          return {
            key: obj.name,
            title: obj.name,
            description: obj.name
          }
        }
      }).filter(Boolean)
      if (writeArr && writeArr.length) {
        setMethodList(writeArr)
      }
      const targetArr = []
      for (let key in item.privilege_methods) {
        if (item.privilege_methods.hasOwnProperty(key)) {
          targetArr.push(key)
        }
      }
      setTargetKeys(targetArr)
      setCurrId(item.id)
      setIsModalOpen(true);
    };
  
    const handleOk = () => {
      const tmpArr = methodList.map(item => item.title)
      const contract_methods = tmpArr.filter(item => !targetKeys.includes(item))
      const params = {
        id: +currId,
        contract_methods: contract_methods,
        privilege_methods: targetKeys
      }
      setModalLoading(true)
      request.post(`${noPrivateKeyUrlPrefix}/contract/method`, {
        data: params
      }).then(function(response) {
          if (response.code === 0) {
            message.success('提交成功！');
            actionRef.current?.reload();
          } else if (response.code === 403) {
            //TODO
            message.error('登录已超时，请重新登录。');
            history.push(LOGINPATH);
          } else {
            message.error('提交失败，原因：' + response.msg);
          }
          setIsModalOpen(false);
          setModalLoading(false);
        })
        .catch(function(error) {
          message.error('提交失败，原因：' +  error.toString());
          setIsModalOpen(false);
          setModalLoading(false);
        })
    };
  
    const handleCancel = () => {
      setIsModalOpen(false)
      setMethodList([])
      setTargetKeys([])
    };

    const onChange = (nextTargetKeys: string[], direction: TransferDirection, moveKeys: string[]) => {
      console.log('targetKeys:', nextTargetKeys);
      console.log('direction:', direction);
      console.log('moveKeys:', moveKeys);
      setTargetKeys(nextTargetKeys);
    };
  
    // 点击勾选框
    const onSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
      console.log('sourceSelectedKeys:', sourceSelectedKeys);
      console.log('targetSelectedKeys:', targetSelectedKeys);
      setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
    };
  
    const onScroll = (direction: TransferDirection, e: React.SyntheticEvent<HTMLUListElement>) => {
      console.log('direction:', direction);
      console.log('target:', e.target);
    };


    const onCreate = (type: any, values: any) => {
      // console.log('Received values of form: ', values);
      const urlObj: any = {
        'new': '/create',
        'edit': '/update',
      };
      const newParam = {
        name: values['name'],
        address: values['address'],
        desc: values['desc'],
        network_id: +values['network_id'],
        deployed_time: values['deployed_time'].format('YYYY-MM-DD HH:mm:ss'),
        department_id: +values['department_id'],
        abi: values['abi'],
        lark_group: values['lark_group'],
      }
      const editParam = {
        id: values['id'],
        ...newParam,
      }
      const param = (type === 'new') ? newParam : editParam;
      console.log(param, values)
      // return;
      setConfirmLoading(true)
      request.post(`${noPrivateKeyUrlPrefix}/contract${urlObj[type]}`, {
        data: param,
      })
      .then(function(response) {
        if (response.code === 0) {
          message.success('提交成功！');
          actionRef.current?.reload();
        } else if (response.code === 403) {
          //TODO
          message.error('登录已超时，请重新登录。');
          history.push(LOGINPATH);
        } else {
          message.error('提交失败，原因：' + response.msg);
        }
        setOpen(false);
        setConfirmLoading(false);
      })
      .catch(function(error) {
        console.log(error);
        setConfirmLoading(false);
      })
    }

    const handleDelete = (key: React.Key) => {
      console.log('handleDelete', key);
      request.post(`${noPrivateKeyUrlPrefix}/contract/delete`, {
        data: { id : key},
      })
      .then(function(response) {
        if (response.code === 0) {
          message.success('提交成功！');
          actionRef.current?.reload();
        } else if (response.code === 403) {
          //TODO
          message.error('登录已超时，请重新登录。');
          history.push(LOGINPATH);
        } else {
          message.error('提交失败，原因：' + response.msg);
        }
      })
      .catch(function(error) {
        console.log(error);
      });
    };

    // 表格的列
    const columns: ProColumns<ContractItem>[] = [
      {
        title: '所属部门',
        key: 'department_id',
        dataIndex: 'department_id',
        valueType: 'select',
        fieldProps: {
          placeholder: "请选择部门",
        },
        renderFormItem: (item, { type, defaultRender }, form) => {
          return <Select 
            onSelect={onDepartmentSelect}
            value={currDepartmentId}
            options={[{
              value: '',
              label: '全部'
            }].concat(deptListFromServer)}
          >
          </Select>
        },
        render:  (data, record, _)=> {
          return <span>{record.department_name}</span>;
        }
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
        title: '合约地址',
        key: 'address',
        dataIndex: 'address',
        ellipsis: true,
        copyable: true,
        hideInSearch: true, // 在查询表单中不展示此项
      },
      {
        title: '合约名称',
        key: 'name',
        dataIndex: 'name',
        // copyable: true,
        ellipsis: true,
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
        width: '180px',
        key: 'option',
        render: (text, record, _, action) => [
          <a key='transfer' onClick={() => showModal(record)}>
            增减特权方法
          </a>,
          <a key='edit' onClick={() => {
            setOpen(true);
            setExtraObj({
              type: 'edit',
              item: record,
              chainFormOptions: chainListFromServer,
              deptFormOptions: deptListFromServer,
            });
          }}>
            编辑
          </a>,
          <Popconfirm key="delete" title="确定要删除吗" onConfirm={() => handleDelete(record.id)}>
            <a>删除</a>
          </Popconfirm>,
        ],
      },
    ];

    return <GridContent>
        <>
            <ProTable<ContractItem>
              columns={columns}
              actionRef={actionRef} // Table action 的引用，便于自定义触发
              cardBordered  // Table 和 Search 外围 Card 组件的边框
              request={async (params = {}, sort, filter) => {
                  console.log('params', params, sort, filter);
                  if (params['project_id'] === 'all') {
                    params['project_id'] = ''
                  }
                  let ret: any = {};
                  await request<{
                      data: ContractItem[];
                  }>(`${noPrivateKeyUrlPrefix}/contract/list`, {
                    params,
                  }).then(r => ret = r);

                  console.log('ret', ret, typeof ret);

                  if (ret.code === 403) {
                    //TODO
                    message.error('登录已超时，请重新登录。');
                    history.push(LOGINPATH);
                  } else if (ret.code !== 0) {
                    message.error('获取地址列表失败，原因：' + ret.msg);
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
              }}
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
              headerTitle="合约基础信息列表"
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
                            deptFormOptions: deptListFromServer,
                          });
                      }}
                      type="primary"
                  >
                  新建
                  </Button>,
              ]}
            />

            <Modal title="增减特权方法" width={'600px'} open={isModalOpen} confirmLoading={modalLoading} onOk={handleOk} onCancel={handleCancel}>
              <Transfer
                dataSource={methodList}
                titles={['普通方法', '特权方法']}
                targetKeys={targetKeys}
                selectedKeys={selectedKeys}
                onChange={onChange}
                onSelectChange={onSelectChange}
                onScroll={onScroll}
                render={item => item.title}
              />
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


export default CONTRACT;