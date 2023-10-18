import { ActionType, ProColumns } from '@ant-design/pro-components';
import { GridContent, ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Radio, Space, Select, Popconfirm, Tooltip, message, Tag } from 'antd';
import { EllipsisOutlined, PlusOutlined, MinusCircleOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import { Suspense, useState, useEffect, useRef } from 'react';
import request from '../../../utils/req';
import PageLoading from '../components/PageLoading';
import { shortenAddress } from '../../../utils/utils';
import { addrUrlPrefix, deptProjUrl } from '../../../utils/constant'

type AddressItem = {
    id: number;
    abi_id: number;
    abi_name: string;
    abi_version: string;
    addr: string;
    network: object;
    tag: string;
    department_id: number;
    department_name: string;
    project_id: number;
    project_name: string;
    create_time: string;
    update_time: string;
};

interface CollectionCreateFormProps {
  open: boolean;
  confirmLoading: boolean;
  extraObj: {[key: string]: any};
  onCreate: (values: AddressItem) => void;
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
  const title = "编辑 (" + extraObj.id + ")";

  const defaultV = { // 'edit'
    ...extraObj,
    department_id: '' + extraObj.department_id,
    project_id: '' + extraObj.project_id,
  }
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
            onCreate(values);
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
        <Form.Item hidden={true} name="abi_id"><Input /></Form.Item>
        <Form.Item hidden={true} name="abi_name"><Input /></Form.Item>
        <Form.Item hidden={true} name="abi_version"><Input /></Form.Item>
        <Form.Item hidden={true} name="network"><Input /></Form.Item>
        <Form.Item hidden={true} name="department_id"><Input /></Form.Item>
        <Form.Item hidden={true} name="department_name"><Input /></Form.Item>
        <Form.Item hidden={true} name="project_id"><Input /></Form.Item>
        <Form.Item hidden={true} name="project_name"><Input /></Form.Item>
        <Form.Item hidden={true} name="create_time"><Input /></Form.Item>
        <Form.Item hidden={true} name="update_time"><Input /></Form.Item>
        
        
        <Form.Item name="addr" label="地址" rules={[{ required: true, message: '请输入abi版本！' }]}>
          <Input disabled={true} />
        </Form.Item>
        <Form.Item
          name="tag"
          label="地址Tag"
          rules={[{ required: true, message: '请输入tag！' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};



const Address: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [messageApi, contextHolder] = message.useMessage();

    const [open, setOpen] = useState(false);
    // const [modalItem, setModalItem] = useState<{[key: string]: any}>({});
    const [extraObj, setExtraObj] = useState({});
    const [confirmLoading, setConfirmLoading] = useState(false);

    // 部门project列表，从服务端获取
    const [deptProjListFromServer, setDeptProjListFromServer] = useState<{[key: string]: any}>([]);
    
    const queryURLObj: any = new URLSearchParams(window.location.search);
    const defaultDeptId = queryURLObj.get("department_id") || '1';
    const defaultProjId = queryURLObj.get("project_id") || 'all';
    // 当前project
    const [currDepartmentId, setDepartmentId] = useState(defaultDeptId);
    const [currProjectId, setCurrProjectId] = useState(defaultProjId);
    const onDepartmentSelect = (selected: any) => {
      setDepartmentId(selected);
      setCurrProjectId('all');
    }
    const onProjectSelect = (selected: any) => {
      console.log('onProjectSelect', selected);
      setCurrProjectId(selected);
    }

    useEffect(() => {
      request
        .get(deptProjUrl)
        .then(function(response) {
          if (response.code === 0) {
            const data = response.data;
            let targetOptionObj: any = {};
            for (let i = 0; i < data.length; i++) {
              const tmpArr1 = [{value: 'all', label: '全部'}];
              const tmpArr2 = data[i].projects.map((item: any) => {
                return {
                  value: '' + item.id,
                  label: item.name,
                }
              })
              targetOptionObj['' + data[i].dept_id] = {
                name: data[i].dept_name,
                child: tmpArr1.concat(tmpArr2),
              };
            }
            // console.log('targetOptionObj', targetOptionObj);
            setDeptProjListFromServer(targetOptionObj);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    }, []);



    const onCreate = (values: any) => {
      // console.log('Received values of form: ', values);
      const param = {
        id: values['id'],
        tag: values['tag'],
      }
      console.log(param, values);
      // return;
      setConfirmLoading(true);
      request.post(`${addrUrlPrefix}/update`, {
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
      })
      .catch(function(error) {
        console.log(error);
        setConfirmLoading(false);
      });
    };

    // 表格的列
    const columns: ProColumns<AddressItem>[] = [
      {
        title: '合约名称',
        dataIndex: 'abi_name',
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
        title: '合约版本',
        key: 'abi_version',
        dataIndex: 'abi_version', // 渲染列的值
      },
      {
        title: '地址',
        dataIndex: 'addr',
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
        title: '所属网络',
        key: 'network',
        dataIndex: 'network',
        hideInSearch: true, // 在查询表单中不展示此项
        render: (data: any, record, _) => {
          // console.log('network', data, record);
          return <span>{data?.name}</span>;
        }
      },
      {
        title: '地址Tag',
        dataIndex: 'tag',
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
        title: '部门',
        key: 'department_id',
        dataIndex: 'department_id',
        valueType: 'select',
        fieldProps: {
          placeholder: "请选择部门",
        },
        renderFormItem: (item, { type, defaultRender }, form) => {
          const keys: any = Object.keys(deptProjListFromServer);
          let options: any = [];
          for (let i = 0; i < keys.length; i++) {
            options.push({
              value: '' + keys[i],
              label: deptProjListFromServer[keys[i]].name,
            });
          }
          return <Select 
            onSelect={onDepartmentSelect}
            options={options}
          >
          </Select>
        },
        render:  (data, record, _)=> {
          return <span>{record.department_name}</span>;
        }
      },
      {
        title: '项目',
        key: 'project_id',
        dataIndex: 'project_id',
        valueType: 'select',
        renderFormItem: (item, { type, defaultRender }, form) => {
          setTimeout(() => {
            form.setFieldValue('project_id', currProjectId);
          }, 10);
          return <Select 
            value={currProjectId}
            onSelect={onProjectSelect}
            options={deptProjListFromServer[currDepartmentId] ? deptProjListFromServer[currDepartmentId]['child'] : []}
          >
          </Select>
        },
        render:  (data, record, _)=> {
          return <span>{record.project_name}</span>;
        }
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
          <a key='edit' onClick={() => {
            setOpen(true);
            setExtraObj(record);
          }}>
            编辑
          </a>,
        ],
      },
    ];

    return <GridContent>
        <>
            {contextHolder}
            <ProTable<AddressItem>
              columns={columns}
              actionRef={actionRef} // Table action 的引用，便于自定义触发
              cardBordered  // Table 和 Search 外围 Card 组件的边框
              request={async (params = {}, sort, filter) => {
                  // console.log('params', params, sort, filter);
                  if (params['project_id'] === 'all') {
                    params['project_id'] = ''
                  }
                  let ret: any = {};
                  await request<{
                      data: AddressItem[];
                  }>(`${addrUrlPrefix}/list`, {
                    params,
                  }).then(r => ret = r);

                  // console.log('ret', ret, typeof ret);

                  if (ret.code !== 0) {
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
                      console.log('form + created_at', values, type);
                      return values;
                  },
              }}
              pagination={{
                  pageSize: 10,
                  onChange: (page) => console.log(page),
              }}
              dateFormatter="string"
              headerTitle="地址列表"
              toolBarRender={() => [
                  // <Button
                  //     key="button"
                  //     icon={<PlusOutlined />}
                  //     onClick={() => {
                  //         // actionRef.current?.reload();
                  //         setOpen(true);
                  //         setExtraObj({
                  //           item: {},
                  //           type: 'new',
                  //         })
                  //     }}
                  //     type="primary"
                  // >
                  // 新建
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


export default Address;