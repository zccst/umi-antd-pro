import { ActionType, ProColumns } from '@ant-design/pro-components';
import { GridContent, ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Spin, Radio, Space, Select, Popconfirm, Tooltip, message, Tag, Upload } from 'antd';
import { EllipsisOutlined, PlusOutlined, MinusCircleOutlined, QuestionCircleOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import { Suspense, useState, useEffect, useRef } from 'react';
import { history, useModel, Link } from 'umi';
import request from '../../utils/req';
import { batchAirdropUrlPrefix, LOGINPATH, AIRDROP_TYPE_LIST } from '../../utils/constant';

import { getChains } from '@/services/ant-design-pro/api';
import { configResponsive } from 'ahooks';

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

const queryURLObj: any = new URLSearchParams(window.location.search);
const defaultAirdropType = queryURLObj.get("airdrop_type") || '';


const AirdropHistory: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [messageApi, contextHolder] = message.useMessage();
  const { initialState } = useModel('@@initialState');
  const [form] = Form.useForm();


  const [currAirdropType, setCurrAirdropType] = useState(defaultAirdropType);
  const onAirdropTypeSelect = (selected: any) => {
    setCurrAirdropType(selected);
  }

  // show detail
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailArr, setDetailArr] = useState([]);

  const showDetail = (address_list: any) => {
    setIsDetailModalOpen(true);
    // TODO
    setDetailArr(address_list)
  }

  const handleDetailOk = () => {
    setIsDetailModalOpen(false);
  };

  const handleDetailCancel = () => {
    setIsDetailModalOpen(false);
  };



  // 表格的列
  const columns: ProColumns<AirdropItem>[] = [
    {
      title: '空投名称',
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
      title: '分组',
      width: '50px',
      key: 'group_id',
      dataIndex: 'group_id',
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '空投网络和代币',
      key: 'network_name',
      dataIndex: 'network_name',
      copyable: true,
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
      render: (text, record, _, action)=> {
        return record.network_name + '(' + record.coin_name + ')'
      },
    },
    {
      title: '空投类型',
      key: 'airdrop_type',
      dataIndex: 'airdrop_type',
      ellipsis: true,
      render: (text, record, _, action)=> {
        let retStr = ""
        AIRDROP_TYPE_LIST.map((item, index) => {
          if (item.value === record.airdrop_type) {
            retStr = item.label
          }
        })
        return retStr
      },
      renderFormItem: (item, { type, defaultRender }, form) => {
        return <Select 
          onSelect={onAirdropTypeSelect}
          value={currAirdropType}
          options={AIRDROP_TYPE_LIST}
        >
        </Select>
      },
    },
    {
      title: '代币名称',
      key: 'coin_name',
      dataIndex: 'coin_name',
      hideInTable: true, // 在 Table 中不展示此列
    },
    {
      title: '单笔交易最大地址数',
      key: 'max_address_num',
      dataIndex: 'max_address_num',
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '操作人',
      key: 'create_user_name',
      dataIndex: 'create_user_name',
      hideInTable: true, // 在 Table 中不展示此列
    },
    {
      title: '状态',
      width: '100px',
      key: 'status',
      dataIndex: 'status',
      ellipsis: true,
      render: (text, record, _, action)=> {
        const statusArr = ['', '未发放', '待确认', '发放成功', '发放失败', '无效']
        return statusArr[record.status]
      },
      renderFormItem: (item, { type, defaultRender }, form) => {
        const options = [
          {value: 1, label: '未发放'},
          {value: 2, label: '待确认'},
          {value: 3, label: '发放成功'},
          {value: 4, label: '发放失败'},
          {value: 5, label: '无效'},
        ]
        return <Select 
          options={options}
        >
        </Select>
      },
    },
    {
      title: '上传时间',
      key: 'update_time',
      dataIndex: 'update_time',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '最后修改时间',
      dataIndex: 'update_time',
      valueType: 'dateRange',
      hideInSearch: false, // 在查询表单中不展示此项
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
        <a key='log' onClick={() => showDetail(record.address_list)}>
          查看空投详情
        </a>
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
          }>(`${batchAirdropUrlPrefix}/task/history`, {
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
        headerTitle="空投历史列表"
        toolBarRender={() => [
        ]}
      />



      <Modal title="查看空投详情" width={600} open={isDetailModalOpen} onOk={handleDetailOk} onCancel={handleDetailCancel}>
        <table>
          <tbody>
          {(!detailArr || !detailArr.length) ?
             <tr><td>暂时没有空投详情。</td></tr>
             : <tr><td>空投地址</td><td>空投数量</td></tr>
          }
          {
            detailArr && detailArr.map((item: any, index) => {
              let addr = ""
              let num = ""
              for ( var key in item) {
                if (item.hasOwnProperty(key)) {
                  addr = key
                  num = item[key]
                }
              }
              return <tr key={index}>
                <td width={'88%'}>{addr}</td>
                <td width={'12%'}><ul style={{paddingLeft: 0}}>{num}</ul></td>
              </tr>
            })
          }
          </tbody>
        </table>
      </Modal>

      
    </>
  </GridContent>;
};


export default AirdropHistory;
