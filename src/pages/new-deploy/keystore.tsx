import { ActionType, ProColumns } from '@ant-design/pro-components';
import { GridContent, ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Spin, Radio, Space, Select, Popconfirm, Tooltip, message, Tag, Upload } from 'antd';
import { EllipsisOutlined, PlusOutlined, MinusCircleOutlined, QuestionCircleOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import { Suspense, useState, useEffect, useRef } from 'react';
import { history, useModel, Link } from 'umi';
import request from '../../utils/req';
import { create2UrlPrefix, LOGINPATH } from '../../utils/constant'

import { getChains } from '@/services/ant-design-pro/api';

type KeystoreItem = {
  id: number;
  name: string;
  content: string;
  address: string;
  username: string;
  department_id: number;
  department_name: string;
  create_time: string;
  update_time: string;
};

interface CollectionCreateFormProps {
  open: boolean;
  confirmLoading: boolean;
  extraObj: {[key: string]: any};
  onCreate: (type: string, values: KeystoreItem) => void;
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
  const title = "创建";

  const defaultV = {
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

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }
  const beforeUpload = async (file: any) => {
    console.log('beforeUpload', file);
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
            console.log(values['content'][0].originFileObj);
            const reader = new FileReader();
            reader.readAsText(values['content'][0].originFileObj);
            reader.onload = () => {
              const cont = typeof reader.result === 'string' ? reader.result : reader.result?.toString()
              values['content'] = cont
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
        <Form.Item hidden={true} name="department_id"><Input /></Form.Item>

        <Form.Item
          name="name"
          label="keystore名称"
          rules={[{ required: true, message: '请输入keystore名称！' }]}
        >
          <Input placeholder="推荐使用用途命名" />
        </Form.Item>

        <Form.Item
          name="content"
          label="Upload"
          rules={[{ required: true, message: '请上传keystore文件！' }]}
          valuePropName="fileList"
          getValueFromEvent={normFile}
          extra="如果上传多个keystore文件，以第一个为准"
        >
          <Upload name="content" action="/upload.do" beforeUpload={beforeUpload} listType="text">
            <Button icon={<UploadOutlined />}>点击上传</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          name="address"
          label="对应地址"
          rules={[{ required: true, message: '请输入对应地址！' }]}
        >
          <Input placeholder="请输入对应地址！" />
        </Form.Item>

      </Form>
    </Modal>
  );
};



const Keystore: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [messageApi, contextHolder] = message.useMessage();
  const { initialState } = useModel('@@initialState');

  const [open, setOpen] = useState(false);
  // const [modalItem, setModalItem] = useState<{[key: string]: any}>({});
  const [extraObj, setExtraObj] = useState({type: '', item: {}});
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [balanceArr, setBalanceArr] = useState([]);
  const [isBalanceSpinning, setIsBalanceSpinning] = useState(false);



  const onCreate = (type: any, values: any) => {
    // console.log(initialState.currentUser);
    values['department_id'] = initialState.currentUser.depts[0].id
    // console.log('Received values of form: ', values);
    const urlObj: any = {
      'new': '/create',
      'edit': '/update',
    };
    const newParam = {
      name: values['name'],
      content: values['content'],
      address: values['address'],
      department_id: values['department_id'],
    }
    
    const param = newParam
    console.log(param, values);
    // return;
    setConfirmLoading(true);
    request.post(`${create2UrlPrefix}/keystore${urlObj[type]}`, {
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
    request.get(`${create2UrlPrefix}/keystore/balance?id=${key}`)
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
    request.post(`${create2UrlPrefix}/keystore/delete`, {
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
  const columns: ProColumns<KeystoreItem>[] = [
    {
      title: 'keystore名称',
      key: 'name',
      dataIndex: 'name',
      copyable: true,
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
      title: 'keystore内容',
      key: 'content',
      dataIndex: 'content',
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: 'keystore对应地址',
      key: 'address',
      dataIndex: 'address',
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
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
        <a key='edit' onClick={() => queryBalance(record.id)}>
          查看余额
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
      <ProTable<KeystoreItem>
        columns={columns}
        actionRef={actionRef} // Table action 的引用，便于自定义触发
        cardBordered  // Table 和 Search 外围 Card 组件的边框
        request={async (params = {}, sort, filter) => {
          console.log('params', params, sort, filter);
          let ret: any = {};
          await request<{
            data: KeystoreItem[];
          }>(`${create2UrlPrefix}/keystore/list`, {
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


export default Keystore;
