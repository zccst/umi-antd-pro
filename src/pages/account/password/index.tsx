import {
  ClusterOutlined,
  ContactsOutlined,
  HomeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-components';
import { Avatar, Card, Col, Divider, Input, Row, Form, Button, message, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import type { RouteChildrenProps } from 'react-router';
import { Link, useRequest, useModel } from 'umi';
import styles from './password.less';
import type { CurrentUser, tabKeyType, TagType } from '../center/data';
import { queryCurrent } from '../center/service';

import { changePassword } from '@/services/ant-design-pro/api';

const Center: React.FC<RouteChildrenProps> = () => {
  const [tabKey, setTabKey] = useState<tabKeyType>('articles');
  const { initialState, setInitialState } = useModel('@@initialState');

  //  获取用户信息
  // const { data: currentUser, loading } = useRequest(() => {
  //   return queryCurrent();
  // });

  const onFinish = async(values: any) => {
    console.log('Success:', values);
    const response = await changePassword(values);
    if (response.code === 0) {
      message.success('重置密码成功！');
    } else {
      message.error('重置密码失败，原因：' + response.msg);
    }
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
            <h1>重置密码</h1>
            {/* {!loading && currentUser && ( */}
            {initialState.currentUser ? (
              <div>
                <Form
                  name="basic"
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  initialValues={{ remember: true }}
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                >
                  <Form.Item
                    label="旧密码"
                    name="old_password"
                    rules={[{ required: true, message: 'Please input your new password!' }]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item
                    label="新密码"
                    name="new_password"
                    rules={[{ required: true, message: 'Please input your new password again!' }]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                      提交重置
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
