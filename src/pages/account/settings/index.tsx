import {
  ClusterOutlined,
  ContactsOutlined,
  HomeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-components';
import { Avatar, Card, Col, Divider, Input, Row, Form, Button, message, Tag } from 'antd';
import React, { useRef, useState, useCallback } from 'react';
import type { RouteChildrenProps } from 'react-router';
import { Link, useRequest, history, useModel, useAccess } from 'umi';
import { stringify } from 'querystring';
import request from '../../../utils/req';
import styles from './password.less';
import type { CurrentUser, tabKeyType, TagType } from '../center/data';
import { queryCurrent } from '../center/service';

import { changePassword } from '@/services/ant-design-pro/api';
import { userUrlPrefix, LOGINPATH } from '../../../utils/constant';



const Center: React.FC<RouteChildrenProps> = () => {
  const [tabKey, setTabKey] = useState<tabKeyType>('articles');
  const { initialState, setInitialState } = useModel('@@initialState');


  // console.log(history, useModel, useAccess);
  const access = useAccess();
  console.log(initialState.currentUser, access.canAdmin ? '管理员' : '普通用户');

  //  获取用户信息
  // const { data: currentUser, loading } = useRequest(() => {
  //   return queryCurrent();
  // });

  const onFinish = async(values: any) => {
    console.log('Success:', values);
    request.post(`${userUrlPrefix}/update`, {
      data: { id : initialState.currentUser.id, name: values['new_name']},
    })
    .then(function(response) {
      if (response.code === 0) {
        message.success('修改成功，重新登录后可看到新昵称！');
      } else if (response.code === 403) {
        //TODO
        message.error('登录已超时，请重新登录。');
        history.push(LOGINPATH);
      } else {
        message.error('修改失败，原因：' + response.msg);
      }
    })
    .catch(function(error) {
      console.log(error);
    });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  // loading={loading}

  return (
    <GridContent>
      <Row gutter={24}>
        <Col lg={16} md={24}>
          <Card bordered={false} style={{ marginBottom: 24 }} >
            <h1>设置</h1>
            {/* {!loading && currentUser && ( */}
            {initialState.currentUser ? (
              <div>
                <Form
                  name="basic"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  initialValues={{ remember: true, name: initialState.currentUser.name }}
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                >
                  <Form.Item
                    label="当前昵称"
                    name="name"
                  >
                    <Input disabled />
                  </Form.Item>

                  <Form.Item
                    label="新昵称"
                    name="new_name"
                    rules={[{ required: true, message: 'Please input your new nickname!' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                      提交
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            )
            :
            <span>请先登录！</span>
          }
          </Card>
        </Col>
      </Row>
    </GridContent>
  );
};
export default Center;
