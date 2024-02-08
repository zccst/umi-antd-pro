import { ActionType, ProColumns } from '@ant-design/pro-components';
import { GridContent, ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Alert, Spin, Radio, Space, Select, Checkbox, Popconfirm, Tooltip, message, Tag, Row, Col } from 'antd';
import type { RadioChangeEvent } from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import { EllipsisOutlined, PlusOutlined, MinusCircleOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import { Suspense, useState, useEffect, useRef } from 'react';
import { history, useModel, Link } from 'umi';
import request from '../../utils/req';
import { create2UrlPrefix, chainUrlPrefix, LOGINPATH } from '../../utils/constant'


type TaskItem = {
    id: number;
    name: string;
    keystore_id: number;
    keystore_name: string;
    network_names: [];
    success: number;
    failed: number;
    salt: string;
    init_code: string;
    data: string;
    create2_forward_value: number;
    call_forward_value: number;
    user_id: number;
    username: string;
    department_id: number;
    department_name: string;
    contract_addr: string;
    log: object[];
    create_time: string;
    update_time: string;
    status: number;
};

type departmentItem = {
  id: number;
  name: string;
}

interface CollectionCreateFormProps {
  open: boolean;
  isSpinning: boolean;
  confirmLoading: boolean;
  chainlistOptions: string[]; // 新知识点
  departmentList: departmentItem[]; // 新知识点
  extraObj: {[key: string]: any};
  onCreate: (type: string, values: TaskItem) => void;
  onCancel: () => void;
}


const CollectionCreateForm: React.FC<CollectionCreateFormProps> = ({
  open,
  isSpinning,
  chainlistOptions,
  confirmLoading,
  extraObj,
  departmentList,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const title = extraObj.type === 'edit' ? "编辑 ( ID=" + extraObj.item.id + " )" : "创建";

  const defaultV = (extraObj.type === 'edit') ? { // 'edit'
    ...extraObj.item,
    network_ids: extraObj.item.network_ids.map((item: any) => {
      return item = '' + item
    }),
  } : {
    name: "",
    salt: "",
    init_code: "",
    data: "",
    create2_forward_value: "0",
    call_forward_value: "0",
    factory_addr: "",
    network_ids: [],
    department_id: (departmentList && departmentList.length) ? departmentList[0].id : '',
    // network_ids: ['1', '2'],
    // department_id: 2,
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

  const onCKChange = (checkedValues: CheckboxValueType[]) => {
    console.log('checked = ', checkedValues);
  };
  const onDepartmentChange = ({ target: { value } }: RadioChangeEvent) => {
    console.log('radio1 checked', value);
    // setValue1(value);
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
      <Spin spinning={isSpinning}>
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          name="form_in_modal"
          // initialValues={{
          //   'checkbox-group': ['Apple', 'Pear'],
          // }}
        >
          <Form.Item hidden={true} name="id"><Input /></Form.Item>

          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称！' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>

          <Form.Item
            name="salt"
            label="salt"
            rules={[{ required: true, message: '请输入salt！' }]}
          >
            <Input placeholder="请输入salt" />
          </Form.Item>

          <Form.Item
            label="init_code"
            name="init_code"
            rules={[{ required: true, message: '请输入init_code！' }]}
          >
            <Input placeholder="请输入init_code" />
          </Form.Item>

          <Form.Item
            name="data"
            label="data"
            // rules={[{ required: true, message: '请输入data！' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="create2_forward_value"
            label="create2_forward_value"
            // rules={[{ required: true, message: '请输入create2_forward_value！' }]}
          >
            <Input placeholder="请输入create2_forward_value，必须是数字" />
          </Form.Item>

          <Form.Item
            name="call_forward_value"
            label="call_forward_value"
            // rules={[{ required: true, message: '请输入call_forward_value！' }]}
          >
            <Input placeholder="请输入call_forward_value，必须是数字" />
          </Form.Item>

          <Form.Item
            name="factory_addr"
            label="factory_addr"
            rules={[{ required: true, message: '请输入factory_addr！' }]}
          >
            <Input placeholder="请输入factory_addr" />
          </Form.Item>

          <Form.Item
            name="network_ids"
            label="network_ids"
            rules={[{ required: true, message: '请输入要部署的链！' }]}
          >
            <Checkbox.Group 
              disabled={extraObj.type === 'edit' ? true : false} 
              options={chainlistOptions} 
              onChange={onCKChange} 
              />
          </Form.Item>

          <Form.Item
            name="department_id"
            label="所属部门"
            rules={[{ required: true, message: '请选择任务所在的部门！' }]}
          >
            <Radio.Group 
              disabled={extraObj.type === 'edit' ? true : false}
              options={departmentList.map((item: any) => {
                return {
                  label: item.name,
                  value: item.id,
                }
              })} 
              onChange={onDepartmentChange} 
              />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};



const Task: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const { initialState } = useModel('@@initialState');
    const [messageApi, contextHolder] = message.useMessage();

    // task new / edit
    const [open, setOpen] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const [chainlistOptions, setChainlistOptions] = useState<string[]>([]); // <{[key: string]: any}>
    const [extraObj, setExtraObj] = useState({type: '', item: {}});
    const [confirmLoading, setConfirmLoading] = useState(false);

    // input keystore before run task
    const [form2] = Form.useForm();
    const [confirmKeystoreLoading, setConfirmKeystoreLoading] = useState(false);
    const [isKeystoreModalOpen, setIsKeystoreModalOpen] = useState(false);
    const [isKeystoreSpinning, setIsKeystoreSpinning] = useState(false);
    const [myKeystoreArr, setMyKeystoreArr] = useState([]);

    const [runType, setRunType] = useState("run");

    // show log
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [logArr, setLogArr] = useState([]);


    const getChainList = () => {
      request
        .get(chainUrlPrefix + '/list')
        .then(function(response) {
          if (response.code === 0) {
            const data = response.data;
            const targetArr = data.map((item: any) => {
              return {
                value: '' + item.id,
                label: item.name,
              }
            });
            setChainlistOptions(targetArr);
            setSpinning(false)
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
    }
    useEffect(() => {
      getChainList()
    }, []);

    const onCreate = (type: any, values: any) => {
      console.log('Received values of form: ', values);
      const urlObj: any = {
        'new': '/create',
        'edit': '/update',
      };
      const commParam = {
        name: values['name'],
        salt: values['salt'],
        init_code: values['init_code'],
        data: values['data'],
        create2_forward_value: +values['create2_forward_value'],
        call_forward_value: +values['call_forward_value'],
        factory_addr: values['factory_addr'],
      }
      const newParam = {
        ...commParam,
        network_ids: values['network_ids'].map((item: any) => {
          return item = +item
        }),
        department_id: values['department_id']
      }
      const editParam = {
        id: values['id'],
        ...commParam,
      }
      const param = (type === 'new') ? newParam : editParam;
      console.log(param, values);
      // return;
      setConfirmLoading(true);
      request.post(`${create2UrlPrefix}/task${urlObj[type]}`, {
        data: param,
      })
      .then(function(response) {
        setConfirmLoading(false);
        if (response.code === 0) {
          setOpen(false);
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
        setConfirmLoading(false);
      });
    };


    // 初始化
  const handleKeystoreOk = () => {
    form2
      .validateFields()
      .then((values) => {
        form2.resetFields()
        console.log('参数values：', values)
        setConfirmKeystoreLoading(true)
        request.post(create2UrlPrefix + '/task/' + (values.runType === 'run' ? 'run' : 'rerun'), {
          data: { 
            id : +values.id,
            keystore_id : +values.keystore_id,
            password : values.password,
          },
        })
          .then(function(response) {
            setConfirmKeystoreLoading(false)
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
    console.log('onKeystoreSelect', selected);
    // setCurrKeystoreId(selected);
  }

  const doRun = (key: React.Key, type: string, keystore_id: number) => {
    console.log('do task run', key, type, keystore_id)
    setIsKeystoreModalOpen(true)
    setIsKeystoreSpinning(true)
    request.get(`${create2UrlPrefix}/keystore/list?current=1`).then(function(response) {
      if (response.code === 0) {
        const arr = response.data.list
        setMyKeystoreArr(arr)
        setIsKeystoreSpinning(false)
        setRunType(type)
        setTimeout(() => {
          form2.setFieldsValue({ 
            runType: type,
            id: key,
            keystore_id: keystore_id > 0 ? keystore_id : ((arr && arr.length) ? arr[0].id : '')
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

  const showLog = (log: any) => {
    setIsLogModalOpen(true);
    setLogArr(log)
  }

  const handleLogOk = () => {
    setIsLogModalOpen(false);
  };

  const handleLogCancel = () => {
    setIsLogModalOpen(false);
  };

    // 表格的列
    const columns: ProColumns<TaskItem>[] = [
      {
        title: '任务名称',
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
        title: '执行的链',
        key: 'network_names',
        dataIndex: 'network_names',
        hideInSearch: true, // 在查询表单中不展示此项
        render: (text, record, _, action)=> {
          return record.network_names.join(',')
        }
      },
      {
        title: '发布人',
        key: 'username',
        dataIndex: 'username',
        hideInSearch: true, // 在查询表单中不展示此项
      },
      {
        title: '所属部门',
        key: 'department_name',
        dataIndex: 'department_name',
        hideInSearch: true, // 在查询表单中不展示此项
      },
      {
        title: '创建时间',
        key: 'create_time',
        dataIndex: 'create_time',
        valueType: 'date',
        sorter: true,
        hideInSearch: true, // 在查询表单中不展示此项
      },
      {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        hideInSearch: true, // 在查询表单中不展示此项
        render: (text, record, _, action)=> {
          const status = +record.status
          return status === 1 ? '未开始' : (status === 2 ? '进行中' : (status === 3 ? '成功' : '失败'))
        }
      },
      {
        title: '运行结果',
        key: 'run_result',
        dataIndex: 'run_result',
        hideInSearch: true, // 在查询表单中不展示此项
        render: (text, record, _, action)=> {
          const status = +record.status
          if (status === 1 || status === 2) {
            return '--'
          }
          return '成功:'+ record.success +  ', 失败:' + record.failed
        }
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
          (+record.status === 1 || +record.status === 4) && <a key='edit' onClick={() => {
            setOpen(true);
            setExtraObj({
              type: 'edit',
              item: record,
            });
          }}>
            编辑
          </a>,
          +record.status === 1 ?
          <a key='run' onClick={() => doRun(record.id, 'run', 0)}>
            运行
          </a> : (+record.status === 4 && +record.failed > 0) ?
          <a key='rerun' onClick={() => doRun(record.id, 'rerun', record.keystore_id)}>
            重试
          </a> : null,
          <a key='log' onClick={() => showLog(record.log)}>
            日志
          </a>
        ],
      },
    ];

    return <GridContent>
        <>
            <Alert
              message="使用流程："
              description="1.上传keystore；2.初始化Keyless和业务工厂（此步骤由系统管理员完成）；3.创建任务；4.运行（自动化部署）。"
              type="info"
              showIcon
              closable
            /> <br />
            {contextHolder}
            <ProTable<TaskItem>
              columns={columns}
              actionRef={actionRef} // Table action 的引用，便于自定义触发
              cardBordered  // Table 和 Search 外围 Card 组件的边框
              request={async (params = {}, sort, filter) => {
                  console.log('params', params, sort, filter);
                  let ret: any = {};
                  await request<{
                      data: TaskItem[];
                  }>(`${create2UrlPrefix}/task/list`, {
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
                          setOpen(true)
                          setSpinning(true)
                          setExtraObj({
                            type: 'new',
                            item: {
                              
                            },
                          });
                          getChainList()
                      }}
                      type="primary"
                  >
                  新建
                  </Button>,
              ]}
            />


            <Modal title="查看日志" width={800} open={isLogModalOpen} onOk={handleLogOk} onCancel={handleLogCancel}>
              <table>
                <tbody>
                  {!logArr.length && <tr><td>暂时没有日志。</td></tr>}
                {
                  logArr.map((item: any, index) => {
                    return <tr key={index}>
                      <td width={'15%'}>{item.network_name}</td>
                      <td width={'85%'}><ul style={{paddingLeft: 0}}>{item.logs.map((item: any) => {
                        return <li>{item}</li>
                      })}</ul></td>
                    </tr>
                  })
                }
                </tbody>
              </table>
            </Modal>


            <CollectionCreateForm
              open={open}
              isSpinning={spinning}
              chainlistOptions={chainlistOptions}
              confirmLoading={confirmLoading}
              departmentList={initialState.currentUser.depts}
              extraObj={extraObj}
              onCreate={onCreate}
              onCancel={() => {
                setOpen(false);
              }}
            />

            <Modal title="输入Keystore助记密码" width={600} confirmLoading={confirmKeystoreLoading} open={isKeystoreModalOpen} onOk={handleKeystoreOk} onCancel={handleKeystoreCancel}>
              <Spin spinning={isKeystoreSpinning}>
                <Form
                  form={form2}
                  layout="horizontal"
                  labelCol={{ span: 7 }}
                  wrapperCol={{ span: 15 }}
                  name="form_in_modal"
                  // initialValues={defaultV}
                >
                  <Form.Item hidden={true} name="id"><Input /></Form.Item>
                  <Form.Item hidden={true} name="runType"><Input /></Form.Item>
                  <Form.Item
                    name="keystore_id"
                    label="选择Keystore"
                    rules={[{ required: true, message: '请选择Keystore！' }]}
                  >
                    <Select 
                      disabled={runType === 'rerun' ? true : false}
                      onSelect={onKeystoreSelect}
                      options={myKeystoreArr.map((item: any) => {
                        return {
                          value: item.id,
                          label: item.name,
                        }
                      })}
                      // value={currKeystoreId}
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


export default Task;
