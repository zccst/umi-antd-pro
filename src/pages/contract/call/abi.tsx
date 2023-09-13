import { ActionType, ProColumns } from '@ant-design/pro-components';
import { GridContent, ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Dropdown, Space, Tag } from 'antd';
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { Suspense, useState, useEffect, useRef } from 'react';
import request from 'umi-request';
import PageLoading from '../components/PageLoading';
import { shortenAddress } from '../../../utils/utils';


export const waitTimePromise = async (time: number = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
};
export const waitTime = async (time: number = 100) => {
    await waitTimePromise(time);
};
  
type GithubIssueItem = {
    url: string;
    id: number;
    number: number;
    title: string;
    labels: {
      name: string;
      color: string;
    }[];
    state: string;
    comments: number;
    created_at: string;
    updated_at: string;
    closed_at?: string;
};
  
const columns: ProColumns<GithubIssueItem>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '标题',
      dataIndex: 'title',
      copyable: true,
      ellipsis: true,
      tip: '标题过长会自动收缩',
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
      disable: true, // 列设置中disabled的状态
      title: '状态',
      dataIndex: 'state',
      filters: true, // 表头的筛选菜单项，当值为 true 时，自动使用 valueEnum 生成
      onFilter: true,// 筛选表单，为 true 时使用 ProTable 自带的，为 false 时关闭本地筛选
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        all: { text: '超长'.repeat(50) },
        open: {
          text: '未解决',
          status: 'Error',
        },
        closed: {
          text: '已解决',
          status: 'Success',
          disabled: true,
        },
        processing: {
          text: '解决中',
          status: 'Processing',
        },
      },
    },
    {
      disable: true, // 列设置中disabled的状态
      title: '标签',
      dataIndex: 'labels',
      search: false, // 配置列的搜索相关，false 为隐藏
      // 渲染查询表单的输入组件
      renderFormItem: (_, { defaultRender }) => {
        return defaultRender(_);
      },
      render: (_, record) => (
        <Space>
          {record.labels.map(({ name, color }) => (
            <Tag color={color} key={name}>
              {name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '创建时间',
      key: 'showTime',
      dataIndex: 'created_at',
      valueType: 'date',
      sorter: true,
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
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
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a href={record.url} target="_blank" rel="noopener noreferrer" key="view">
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


const Abi: React.FC = () => {
    const actionRef = useRef<ActionType>();


    const deptHandleChange = (value: string) => {
        console.log(`selected ${value}`);
    };
    const projectHandleChange = (value: string) => {
        console.log(`selected ${value}`);
    };
    const envHandleChange = (value: string) => {
        console.log(`selected ${value}`);
    };

    return <GridContent>
        <>
            <ProTable<GithubIssueItem>
                columns={columns}
                actionRef={actionRef} // Table action 的引用，便于自定义触发
                cardBordered  // Table 和 Search 外围 Card 组件的边框
                request={async (params = {}, sort, filter) => {
                    console.log('params', sort, filter);
                    // await waitTime();
                    return request<{
                        data: GithubIssueItem[];
                    }>('https://proapi.azurewebsites.net/github/issues', {
                        params,
                    });
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
        </>
    </GridContent>;
};


export default Abi;