import { ActionType, ProColumns } from '@ant-design/pro-components';
import { GridContent, ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Alert, Radio, Space, Select, Popconfirm, Tooltip, message, Tag } from 'antd';
import { EllipsisOutlined, PlusOutlined, MinusCircleOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import { Suspense, useState, useEffect, useRef } from 'react';
import { history, Link } from 'umi';
import request from '../../../utils/req';
import PageLoading from '../../contract/components/PageLoading';
import { shortenAddress } from '../../../utils/utils';
import { chainUrlPrefix, LOGINPATH } from '../../../utils/constant'

import { getChains } from '@/services/ant-design-pro/api';

type ChainItem = {
    id: number;
    name: string;
    token: string;
    chain_id: number;
    create_time: string;
    update_time: string;
};

interface CollectionCreateFormProps {
  open: boolean;
  confirmLoading: boolean;
  extraObj: {[key: string]: any};
  onCreate: (type: string, values: ChainItem) => void;
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
  const title = extraObj.type === 'edit' ? "编辑 ( ID=" + extraObj.item.id + " )" : "创建";

  const defaultV = (extraObj.type === 'edit') ? { // 'edit'
    ...extraObj.item,
    chain_id: '' + extraObj.item.chain_id,
  } : {
    chain_id: '',
    name: "",
    token: "",
    rpc: "",
    explorer_url: "",
  }
  // extraObj.deptFormOptions[0]是全部
  console.log('defaultV', extraObj, defaultV);
  
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
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 19 }}
        name="form_in_modal"
        // initialValues={defaultV}
      >
        <Form.Item hidden={true} name="id"><Input /></Form.Item>
        <Form.Item hidden={true} name="create_time"><Input /></Form.Item>
        <Form.Item hidden={true} name="update_time"><Input /></Form.Item>
        
        <Form.Item
          name="name"
          label="链名称"
          rules={[{ required: true, message: '请输入链名称！' }]}
        >
          <Input placeholder="如X1 Testnet" />
        </Form.Item>

        <Form.Item
          name="token"
          label="Token"
          rules={[{ required: true, message: '请输入Token名称！' }]}
        >
          <Input placeholder="请输入大写字母，如ETH" />
        </Form.Item>

        <Form.Item 
          label="链id"
          name="chain_id"
          rules={[{ required: true, message: '请输入链id，十六进制数据！' }]}
        >
          <Input placeholder="请输入0x开头的16进制，或10进制。如0xc3或195" />
        </Form.Item>

        <Form.Item
          name="rpc"
          label="rpc地址"
          rules={[{ required: true, message: '请输入rpc地址！' }]}
        >
          <Input placeholder="https开头" />
        </Form.Item>

        <Form.Item
          name="explorer_url"
          label="浏览器URL"
          // rules={[{ required: true, message: '请输入浏览器URL！' }]}
        >
          <Input placeholder="https开头" />
        </Form.Item>
        
      </Form>
    </Modal>
  );
};



const ChainManage: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [messageApi, contextHolder] = message.useMessage();

    const [open, setOpen] = useState(false);
    // const [modalItem, setModalItem] = useState<{[key: string]: any}>({});
    const [extraObj, setExtraObj] = useState({type: '', item: {}});
    const [confirmLoading, setConfirmLoading] = useState(false);



    const onCreate = (type: any, values: any) => {
      // console.log('Received values of form: ', values);
      const urlObj: any = {
        'new': '/create',
        'edit': '/update',
      };
      const newParam = {  
        name: values['name'],
        token: values['token'].toUpperCase(),
        chain_id: values['chain_id'],
        rpc: values['rpc'],
        explorer_url: values['explorer_url'],
      }
      const editParam = {
        id: values['id'],
        name: values['name'],
        token: values['token'].toUpperCase(),
        chain_id: values['chain_id'],
        rpc: values['rpc'],
        explorer_url: values['explorer_url'],
      }
      const param = (type === 'new') ? newParam : editParam;
      console.log(param, values);
      // return;
      setConfirmLoading(true);
      request.post(`${chainUrlPrefix}${urlObj[type]}`, {
        data: param,
      })
      .then(function(response) {
        if (response.code === 0) {
          messageApi.open({
            type: 'success',
            content: '提交成功！',
          });
          window.location.reload();
          // actionRef.current?.reload();
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

    const handleDelete = (key: React.Key) => {
      console.log('handleDelete', key);
      request.post(`${chainUrlPrefix}/delete`, {
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

    const updateLocalStorageChains = async () => {
      const result = await getChains();
      let finalChain = [];
      if ( result.code === 0) {
          console.log('chain manage page getChains', result.data);
          finalChain = result.data.map((item: any) => {
              return {
                  id: item.chain_id,
                  token: item.token,
                  label: item.name,
                  rpcUrl: item.rpc,
              }
          });
      }
      localStorage.setItem('GLOBAL_CHAINS', JSON.stringify(finalChain));
    }

    // 表格的列
    const columns: ProColumns<ChainItem>[] = [
      // {
      //   title: 'ID',
      //   dataIndex: 'id',
      //   // copyable: true,
      //   // ellipsis: true,
      //   // tip: '名称过长会自动收缩',
      //   // 传递给 Form.Item 的配置
      //   hideInSearch: true, // 在查询表单中不展示此项
      //   formItemProps: {
      //     rules: [
      //       {
      //         required: true,
      //         message: '此项为必填项',
      //       },
      //     ],
      //   },
      // },
      {
        title: '链名称',
        key: 'name',
        dataIndex: 'name',
        // copyable: true,
        ellipsis: true,
        // tip: '名称过长会自动收缩',
        // 传递给 Form.Item 的配置
        formItemProps: {
          rules: [
            {
              required: true,
              message: '此项为必填项',
            },
          ],
        },
      },
      {
        title: 'Token',
        key: 'token',
        dataIndex: 'token',
        hideInSearch: true, // 在查询表单中不展示此项
      },
      {
        title: 'ChainID',
        key: 'chain_id',
        dataIndex: 'chain_id',
        hideInSearch: true, // 在查询表单中不展示此项
      },
      {
        title: 'RPC地址',
        key: 'rpc',
        dataIndex: 'rpc',
        ellipsis: true,
        hideInSearch: true, // 在查询表单中不展示此项
      },
      {
        title: '浏览器URL',
        key: 'explorer_url',
        ellipsis: true,
        dataIndex: 'explorer_url',
        hideInSearch: true, // 在查询表单中不展示此项
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
          <a key='edit' onClick={() => {
            setOpen(true);
            setExtraObj({
              type: 'edit',
              item: record,
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
            <Alert message="该页面仅系统管理员可写，如需 添加/编辑/删除 请联系 chao.zheng@okg.com 或 hengfang.wang@okg.com，谢谢！" type="info" showIcon closable />
            <br />
            {contextHolder}
            
            <ProTable<ChainItem>
              columns={columns}
              actionRef={actionRef} // Table action 的引用，便于自定义触发
              cardBordered  // Table 和 Search 外围 Card 组件的边框
              request={async (params = {}, sort, filter) => {
                  console.log('params', params, sort, filter);
                  let ret: any = {};
                  await request<{
                      data: ChainItem[];
                  }>(`${chainUrlPrefix}/access_list`, {
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

                  updateLocalStorageChains();

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
              headerTitle="项目列表"
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
                          });
                      }}
                      type="primary"
                  >
                  新建
                  </Button>,
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


export default ChainManage;