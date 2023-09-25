import { ActionType, ProColumns } from '@ant-design/pro-components';
import { GridContent, ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Radio, Space, Select, Popconfirm, Tooltip, message, Tag } from 'antd';
import { EllipsisOutlined, PlusOutlined, MinusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import { Suspense, useState, useEffect, useRef } from 'react';
import request from 'umi-request';
import PageLoading from '../components/PageLoading';
import { shortenAddress } from '../../../utils/utils';
import { abiUrlPrefix } from '../../../utils/constant'

type AbiItem = {
    id: number;
    name: string;
    version: number;
    env: string;
    state: string;
    department_id: number;
    department_name: string;
    project_id: number;
    project_name: string;
    last_edit_user_id: number;
    last_edit_user_name: string;
    create_time: string;
    update_time: string;
    latest: boolean;
    updatable: boolean;
    addrs: [];
    abi: string;
};

interface CollectionCreateFormProps {
  open: boolean;
  confirmLoading: boolean;
  extraObj: {[key: string]: any};
  onCreate: (type: string, values: AbiItem) => void;
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
  const titleObj: any = {
    new: "新建",
    copy: "复制",
    edit: '修改 ' + extraObj.item.name + '(' + extraObj.item.version + ')',
    upgrade: "添加abi新版本",
  }
  const isDisabled = (extraObj.type === 'new' || extraObj.type === 'copy') ? false : true;

  const defaultV = (extraObj.type === 'new') ? {
    name: "",
    updatable: "true",
    env: "prod",
    version: "",
    department_id: "",
    project_id: "",
    department_name: "",
    project_name: "",
    abi: "",
    addrs: []
  } : (extraObj.type === 'upgrade') ? {
    ...extraObj.item,
    updatable: extraObj.item.updatable ? 'true' : 'false',
    department_id: '' + extraObj.item.department_id,
    project_id: '' + extraObj.item.project_id,
    abi: "",
  } : { // 'edit' and 'copy'
    ...extraObj.item,
    updatable: extraObj.item.updatable ? 'true' : 'false',
    department_id: '' + extraObj.item.department_id,
    project_id: '' + extraObj.item.project_id,
  }
  console.log('defaultV', extraObj.type, defaultV);
  
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
      title={titleObj[extraObj.type]}
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
        <Form.Item hidden={true} name="latest"><Input /></Form.Item>
        <Form.Item hidden={true} name="create_time"><Input /></Form.Item>
        <Form.Item hidden={true} name="update_time"><Input /></Form.Item>
        {/* <Form.Item hidden={true} name="department_id"><Input /></Form.Item> */}
        {/* <Form.Item hidden={true} name="project_id"><Input /></Form.Item> */}
        <Form.Item hidden={true} name="last_edit_user_id"><Input /></Form.Item>
        <Form.Item hidden={true} name="last_edit_user_name"><Input /></Form.Item>
        <Form.Item hidden={true} name="state"><Input /></Form.Item>
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入abi的名称！' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="updatable" label="abi类型">
          <Radio.Group disabled={isDisabled}>
            <Radio value="true">可升级的abi</Radio>
            <Radio value="false">不可升级的abi</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="env" label="所属环境">
          <Radio.Group disabled={isDisabled}>
            <Radio value="prod">prod</Radio>
            <Radio value="test">test</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="version" label="abi版本" rules={[{ required: true, message: '请输入abi版本！' }]}>
          <Input disabled={(extraObj.type === 'edit') ? true : false} />
        </Form.Item>
        <Form.Item 
          label="所属部门"
          name="department_id"
          rules={[{ required: true, message: '请选择所属部门！' }]}
        >
          <Select disabled={(extraObj.type === 'upgrade') ? true : false}>
            <Select.Option value="1">DEX</Select.Option>
            <Select.Option value="2">NFT</Select.Option>
            <Select.Option value="3">EARN</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item 
          label="所属项目"
          name="project_id"
          rules={[{ required: true, message: '请选择所属项目！' }]}
        >
          <Select disabled={(extraObj.type === 'upgrade') ? true : false}>
            <Select.Option value="1">dex_testProject</Select.Option>
            <Select.Option value="2">nft_testProject</Select.Option>
            <Select.Option value="3">earn_testProject</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="abi" hidden={(extraObj.type === 'edit') ? true : false}  label="abi正文"  rules={[{ required: true, message: '内容不能为空！' }]}>
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item name="address" label="关联地址">
          <Form.List name="addrs">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'chain_name']}
                    >
                      <Select style={{ width: 140 }}>
                        <Select.Option value="Ethereum">ETH</Select.Option>
                        <Select.Option value="Goerli">Goerli</Select.Option>
                        <Select.Option value="Binance">Binance</Select.Option>
                        <Select.Option value="Polygon">Polygon</Select.Option>
                        <Select.Option value="Fantom">Fantom</Select.Option>
                        <Select.Option value="Optimism">Optimism</Select.Option>
                        <Select.Option value="Arbitrum">Arbitrum</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'addr']}
                      rules={[{ required: true, message: '缺少地址' }]}
                    >
                      <Input placeholder="请输入地址" style={{width: 300}} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'tag']}
                    >
                      <Input placeholder="请输入地址标签" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加新地址
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Modal>
  );
};



const Abi: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [messageApi, contextHolder] = message.useMessage();

    const [open, setOpen] = useState(false);
    // const [modalItem, setModalItem] = useState<{[key: string]: any}>({});
    const [extraObj, setExtraObj] = useState({type: '', item: {}});
    const [confirmLoading, setConfirmLoading] = useState(false);
    
    const onCreate = (type: any, values: any) => {
      console.log('Received values of form: ', type, values);
      
      const urlObj: any = {
        'new': '/create',
        'copy': '/create',
        'upgrade': '/upgrade',
        'edit': '/update',
      }
      // new/copy 7个必填，1个选填
      const newOrCopyParam = {
        name: values['name'],
        updatable: values['updatable'] === "true" ? true : false,
        env: values['env'],
        version: values['version'],
        department_id: +values['department_id'],
        project_id: +values['project_id'],
        abi: values['abi'],
        addrs: values['addrs'],
      }
      // edit 除了id，4个必填，1个选填
      const editParam = {
        id: values['id'],
        name: values['name'],
        department_id: +values['department_id'],
        project_id: +values['project_id'],
        addrs: values['addrs'],
      }
      // upgrade 除了id，2个必填，1个选填
      const upgradeParam = {
        id: values['id'],
        version: values['version'],
        abi: values['abi'],
        addrs: values['addrs'],
      }
      const url = `${abiUrlPrefix}${urlObj[type]}`;
      const param = (type === 'edit') ? editParam : (type === 'upgrade') ? upgradeParam : newOrCopyParam;
      console.log(url, param);
      // return;
      setConfirmLoading(true);
      request.post(url, {
        data: param,
      })
      .then(function(response) {
        if (response.code === 0) {
          messageApi.open({
            type: 'success',
            content: '提交成功！',
          });
          actionRef.current?.reload();
        } else {
          messageApi.open({
            type: 'error',
            content: '提交失败，原因：' + response.msg,
          });
        }
        setOpen(false);
        setConfirmLoading(false);

        console.log('request success', type, response);
      })
      .catch(function(error) {
        console.log(error);
        setConfirmLoading(false);
      });
      // setTimeout(() => {
      //   setOpen(false);
      //   setConfirmLoading(false);
      // }, 2000);
    };
    const handleDelete = (key: React.Key) => {
      console.log('handleDelete', key);
      request.post(`${abiUrlPrefix}/delete`, {
        data: { id : key},
      })
      .then(function(response) {
        if (response.code === 0) {
          messageApi.open({
            type: 'success',
            content: '提交成功！',
          });
          actionRef.current?.reload();
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
    const columns: ProColumns<AbiItem>[] = [
      {
        title: '名称',
        dataIndex: 'name',
        copyable: true,
        ellipsis: true,
        tip: '名称过长会自动收缩',
        // 传递给 Form.Item 的配置
        formItemProps: {
          rules: [
            {
              required: true,
              message: '此项为必填项',
            },
          ],
        },
        // render:  (data, record, _)=> {
        //   return <span>{record.name} <Tag color="blue">{record.updatable ? '可升级': '不可升级'}</Tag></span>;
        // }
      },
      {
        disable: true, // 列设置中disabled的状态
        title: '可否升级',
        dataIndex: 'updatable',
        filters: true, // 表头的筛选菜单项，当值为 true 时，自动使用 valueEnum 生成
        onFilter: true,// 筛选表单，为 true 时使用 ProTable 自带的，为 false 时关闭本地筛选
        ellipsis: true,
        valueType: 'select',
        valueEnum: {
          true: {
            text: '是',
            status: 'Success',
          },
          false: {
            text: '否',
            status: 'Error',
          },
        },
      },
      {
        title: '版本',
        key: 'version',
        dataIndex: 'version',
        hideInSearch: true, // 在查询表单中不展示此项
      },
      {
        title: '已关联地址',
        key: 'addrs',
        dataIndex: 'addrs',
        hideInSearch: true, // 在查询表单中不展示此项
        render: (data, record, _) => {
          const addrArr = record.addrs.map((item: any, index) => {
            return '[' + item.chain_name + '] ' +  item.addr + ' (' + item.tag + ')';
          });
          console.log('record.addrs', record.addrs);
          return record.addrs.length ? <Tooltip placement="bottom" title={addrArr.join('\n')} overlayStyle={{ maxWidth: 600 }}>
            <a>{record.addrs.length} <QuestionCircleOutlined /></a>
          </Tooltip> : '0';
        }
      },
      {
        title: '环境',
        key: 'env',
        dataIndex: 'env',
        valueType: 'select',
        valueEnum: {
          all: {text: '全部'},
          available: {
            text: 'prod',
          },
          disable: {
            text: 'test',
          },
        },
      },
      // {
      //   disable: true, // 列设置中disabled的状态
      //   title: '状态',
      //   dataIndex: 'state',
      //   filters: true, // 表头的筛选菜单项，当值为 true 时，自动使用 valueEnum 生成
      //   onFilter: true,// 筛选表单，为 true 时使用 ProTable 自带的，为 false 时关闭本地筛选
      //   ellipsis: true,
      //   valueType: 'select',
      //   valueEnum: {
      //     all: {text: '全部'},
      //     available: {
      //       text: '正常',
      //       status: 'Success',
      //     },
      //     disable: {
      //       text: '不可用',
      //       status: 'Error',
      //     },
      //   },
      // },
      {
        title: '部门',
        key: 'department_name',
        dataIndex: 'department_name',
        valueType: 'select',
      },
      {
        title: '项目',
        key: 'project_name',
        dataIndex: 'project_name',
        valueType: 'select',
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
          <Popconfirm key="delete" title="确定要删除吗" onConfirm={() => handleDelete(record.id)}>
            <a>删除</a>
          </Popconfirm>,
          <a onClick={() => {
            setOpen(true);
            setExtraObj({
              item: record,
              type: 'copy',
            })
          }}>复制</a>,
          <TableDropdown
            key="actionGroup"
            onSelect={(operate) => {
              setOpen(true);
              if (operate === 'upgrade') {
                setExtraObj({
                  item: record,
                  type: 'upgrade',
                })
              } else if (operate === 'edit') {
                setExtraObj({
                  item: record,
                  type: 'edit',
                })
              }
            }}
            menus={[
              { key: 'upgrade', name: '添加新版本' },
              { key: 'edit', name: '编辑' },
            ]}
          />,
        ],
      },
    ];

    return <GridContent>
        <>
            {contextHolder}
            <ProTable<AbiItem>
              columns={columns}
              actionRef={actionRef} // Table action 的引用，便于自定义触发
              cardBordered  // Table 和 Search 外围 Card 组件的边框
              request={async (params = {}, sort, filter) => {
                  console.log('params', params, sort, filter);
                  params = {
                    ...params,
                    page: params.current,
                    size: params.pageSize,
                  };
                  console.log('params', params);
                  let ret: any = {};
                  await request<{
                      data: AbiItem[];
                  }>(`${abiUrlPrefix}/list`, {
                    params,
                  }).then(r => ret = r);
                  
                  console.log('ret', ret, typeof ret);

                  if (ret.code > 0) {
                    messageApi.open({
                      type: 'error',
                      content: '获取地址列表失败，原因：' + ret.msg,
                    });
                    return Promise.resolve({
                      data: [],
                      success: false,
                      total: 0,
                    });
                  }
                  const res = {
                    data: ret.data.list,
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
              }}
              options={{ // table 工具栏，设为 false 时不显示.传入 function 会点击时触发
                  setting: {
                      listsHeight: 400,
                  },
              }}
              form={{
                  // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
                  syncToUrl: (values, type) => {
                      console.log('form', values, type);
                      if (type === 'get') {
                          console.log('form + get', values, type);
                          return {
                              ...values,
                              created_at: [values.startTime, values.endTime],
                          };
                      }
                      console.log('form + created_at', values, type);
                      return values;
                  },
              }}
              pagination={{
                  pageSize: 10,
                  onChange: (page) => console.log(page),
              }}
              dateFormatter="string"
              headerTitle="高级表格"
              toolBarRender={() => [
                  <Button
                      key="button"
                      icon={<PlusOutlined />}
                      onClick={() => {
                          // actionRef.current?.reload();
                          setOpen(true);
                          setExtraObj({
                            item: {},
                            type: 'new',
                          })
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


export default Abi;