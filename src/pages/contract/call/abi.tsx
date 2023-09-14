import { ActionType, ProColumns } from '@ant-design/pro-components';
import { GridContent, ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Radio, Tag } from 'antd';
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { Suspense, useState, useEffect, useRef } from 'react';
import request from 'umi-request';
import PageLoading from '../components/PageLoading';
import { shortenAddress } from '../../../utils/utils';



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

interface Values {
  title: string;
  description: string;
  modifier: string;
}

interface CollectionCreateFormProps {
  open: boolean;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const CollectionCreateForm: React.FC<CollectionCreateFormProps> = ({
  open,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();
  return (
    <Modal
      open={open}
      title="Create a new collection"
      okText="Create"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ modifier: 'public' }}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please input the title of collection!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input type="textarea" />
        </Form.Item>
        <Form.Item name="modifier" className="collection-create-form_last-form-item">
          <Radio.Group>
            <Radio value="public">Public</Radio>
            <Radio value="private">Private</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};



const Abi: React.FC = () => {
    const actionRef = useRef<ActionType>();

    const [form] = Form.useForm();

    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalItem, setModalItem] = useState<{[key: string]: any}>({});
    // const [modalItem, setModalItem] = useState({});

    // 修改
    const showModal = (item: any) => {
      setOpen(true);
      setModalItem(item);
      console.log('showModal', item);
    };
    const handleOk = () => {
      setConfirmLoading(true);
      setTimeout(() => {
        setOpen(false);
        setConfirmLoading(false);
      }, 2000);
    };
    const handleCancel = () => {
      console.log('Clicked cancel button');
      setOpen(false);
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
      {
        disable: true, // 列设置中disabled的状态
        title: '状态',
        dataIndex: 'state',
        filters: true, // 表头的筛选菜单项，当值为 true 时，自动使用 valueEnum 生成
        onFilter: true,// 筛选表单，为 true 时使用 ProTable 自带的，为 false 时关闭本地筛选
        ellipsis: true,
        valueType: 'select',
        valueEnum: {
          all: {text: '全部'},
          available: {
            text: '正常',
            status: 'Success',
          },
          disable: {
            text: '不可用',
            status: 'Error',
          },
        },
      },
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
          <a
            key="editable"
            onClick={() => {
              console.log('edit', record);
              // action?.startEditable?.(record.id);
              showModal(record);
            }}
          >
            编辑
          </a>,
          <a href={'https://www.baidu.com'} target="_blank" rel="noopener noreferrer" key="view">
            查看
          </a>,
          <TableDropdown
            key="actionGroup"
            onSelect={() => action?.reload()}
            menus={[
              { key: 'copy', name: '复制' },
              { key: 'delete', name: '删除' },
            ]}
          />,
        ],
      },
    ];
    console.log('modalItem.env', modalItem?.env);

    return <GridContent>
        <>
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
                    }>('http://44.238.134.212:8020/api/v1/abi/list', {
                      params,
                    }).then(r => ret = r);
                    console.log('ret', ret, typeof ret);
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
                        console.log('columnsState onChange value: ', value);
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
                            actionRef.current?.reload();
                        }}
                        type="primary"
                    >
                    新建
                    </Button>,
                ]}
                />

            <Modal
              title="Title"
              open={open}
              onOk={handleOk}
              confirmLoading={confirmLoading}
              onCancel={handleCancel}
            >
              <Form
                form={form}
                name="form_in_modal"
                initialValues={{
                  ...modalItem ,
                  updatable: modalItem?.updatable ? 'true' : "false"
                }
                }
              >
                <Form.Item
                  name="title"
                  label="Title"
                  rules={[{ required: true, message: 'Please input the title of collection!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input type="textarea" />
                </Form.Item>
                <Form.Item name="updatable" label="abi类型">
                  <Radio.Group>
                    <Radio value="true">可升级</Radio>
                    <Radio value="false">不可升级</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item name="env" label="所属环境">
                  <Radio.Group>
                    <Radio value="prod">prod</Radio>
                    <Radio value="test">test</Radio>
                  </Radio.Group>
                </Form.Item>
                <p>{modalItem.env}</p>
              </Form>
            </Modal>
        </>
    </GridContent>;
};


export default Abi;