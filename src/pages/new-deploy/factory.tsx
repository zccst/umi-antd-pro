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
import { configResponsive } from 'ahooks';

type FactoryItem = {
  network_id: number;
  network_name: string;
  network_chain_id: string;
  factory_address: string;
  username: string;
  init: boolean;
  create_time: string;
  update_time: string;
};




const Factory: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [messageApi, contextHolder] = message.useMessage();
  const { initialState } = useModel('@@initialState');
  const [form] = Form.useForm();

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isKeystoreModalOpen, setIsKeystoreModalOpen] = useState(false);

  const [currKeystoreId, setCurrKeystoreId] = useState("");
  const [myKeystoreArr, setMyKeystoreArr] = useState([]);
  const [isKeystoreSpinning, setIsKeystoreSpinning] = useState(false);

  // 初始化
  const handleKeystoreOk = () => {
    setConfirmLoading(true)
    form
      .validateFields()
      .then((values) => {
        form.resetFields()
        console.log('参数values：', values)
        request.post(`${create2UrlPrefix}/factory/init`, {
          data: { 
            network_id : +values.network_id,
            keystore_id : +values.keystore_id,
            password : values.password,
          },
        })
          .then(function(response) {
            setConfirmLoading(false)
            setIsKeystoreModalOpen(false);
            if (response.code === 0) {
              messageApi.open({ type: 'success', content: '提交成功！' });
              actionRef.current?.reload()
            } else if (response.code === 403) {
              //TODO
              message.error('登录已超时，请重新登录。');
              history.push(LOGINPATH);
            } else {
              messageApi.open({ type: 'error', content: '提交失败，原因：' + response.msg });
            }
          })
          .catch(function(error) {
            console.log(error);
          });
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });

    
    
  };

  const handleKeystoreCancel = () => {
    setIsKeystoreModalOpen(false);
  };

  const onKeystoreSelect = (selected: any) => {
    setCurrKeystoreId(selected);
  }

  const doInit = (key: React.Key) => {
    console.log('do factory init', key);
    setIsKeystoreModalOpen(true)
    setIsKeystoreSpinning(true)
    request.get(`${create2UrlPrefix}/keystore/list?current=1`).then(function(response) {
      if (response.code === 0) {
        const arr = response.data.list
        setMyKeystoreArr(arr)
        setIsKeystoreSpinning(false)
        setTimeout(() => {
          form.setFieldsValue({ 
            network_id: key,
            keystore_id: (arr && arr.length) ? arr[0].id : ''
          });
        }, 10);
      } else if (response.code === 403) {
        //TODO
        message.error('登录已超时，请重新登录。');
        history.push(LOGINPATH);
      } else {
        messageApi.open({ type: 'error', content: '提交失败，原因：' + response.msg });
      }
    })
    .catch(function(error) {
      console.log(error);
    });
    
  };



  // 表格的列
  const columns: ProColumns<FactoryItem>[] = [
    {
      title: '链',
      key: 'network_name',
      dataIndex: 'network_name',
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
      title: 'ChainId',
      key: 'network_chain_id',
      dataIndex: 'network_chain_id',
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '业务工厂地址',
      key: 'factory_address',
      dataIndex: 'factory_address',
      copyable: true,
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '是否初始化',
      key: 'init',
      dataIndex: 'init',
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
      render: (text, record, _, action)=> {
        return record.init ? '已初始化' : '未初始化'
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
        !record.init ?
        <a key='init' onClick={() => doInit(record.network_id)}>
          初始化
        </a> : null,
      ],
    },
  ];

  return <GridContent>
    <>
      {contextHolder}
      <ProTable<FactoryItem>
        columns={columns}
        actionRef={actionRef} // Table action 的引用，便于自定义触发
        cardBordered  // Table 和 Search 外围 Card 组件的边框
        request={async (params = {}, sort, filter) => {
          console.log('params', params, sort, filter);
          let ret: any = {};
          await request<{
            data: FactoryItem[];
          }>(`${create2UrlPrefix}/factory/list`, {
            params,
          }).then(r => ret = r);

          console.log('ret', ret, typeof ret);

          if (ret.code === 403) {
            //TODO
            message.error('登录已超时，请重新登录。');
            history.push(LOGINPATH);
          } else if (ret.code !== 0) {
            messageApi.open({ type: 'error', content: '获取链列表失败，原因：' + ret.msg });
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
        rowKey="network_id"
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
        ]}
      />

      <Modal title="输入Keystore助记密码" width={600} confirmLoading={confirmLoading} open={isKeystoreModalOpen} onOk={handleKeystoreOk} onCancel={handleKeystoreCancel}>
        <Spin spinning={isKeystoreSpinning}>
          <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 15 }}
            name="form_in_modal"
            // initialValues={defaultV}
          >
            <Form.Item hidden={true} name="network_id"><Input /></Form.Item>
            <Form.Item
              name="keystore_id"
              label="选择Keystore"
              rules={[{ required: true, message: '请选择Keystore！' }]}
            >
              <Select 
                onSelect={onKeystoreSelect}
                options={myKeystoreArr.map((item: any) => {
                  return {
                    value: item.id,
                    label: item.name,
                  }
                })}
                value={currKeystoreId}
              >
              </Select>
            </Form.Item>
            <Form.Item
              name="password"
              label="助记密码"
              rules={[{ required: true, message: '请输入助记密码！' }]}
            >
              <Input.Password placeholder="助记密码" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  </GridContent>;
};


export default Factory;
