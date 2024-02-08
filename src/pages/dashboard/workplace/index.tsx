import { ActionType, ProColumns } from '@ant-design/pro-components';
import { GridContent, ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Form, Input, Alert, Modal, Spin, Radio, Space, Select, Popconfirm, Tooltip, message, Tag, Upload } from 'antd';
import { EllipsisOutlined, PlusOutlined, MinusCircleOutlined, QuestionCircleOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import { Suspense, useState, useEffect, useRef } from 'react';
import { history, useModel, Link } from 'umi';
import request from '../../../utils/req';
import { create2UrlPrefix, LOGINPATH } from '../../../utils/constant'

import { getChains } from '@/services/ant-design-pro/api';





const Dashboard: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const { initialState } = useModel('@@initialState');



  return <GridContent>
    <>
      <h1>我的工作台</h1>
      <Alert
        message="近期升级："
        description="2024-02-07 上线了新合约发布模块。"
        type="info"
        showIcon
        closable
      />
    </>
  </GridContent>;
};


export default Dashboard;
