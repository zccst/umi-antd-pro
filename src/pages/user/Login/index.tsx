import Footer from '@/components/Footer';
import { login } from '@/services/ant-design-pro/api';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Alert, message, Tabs, Spin } from 'antd';
import { parse } from 'querystring';
import React, { useState, useEffect } from 'react';
import { FormattedMessage, history, SelectLang, useIntl, useModel } from 'umi';
import styles from './index.less';
import request from '../../../utils/req';
import { LOGINPATH, OKENGINE, rootAPIURL } from '../../../utils/constant'

import { getChains } from '@/services/ant-design-pro/api';


const queryURLObj: any = new URLSearchParams(window.location.search);
const authcode = queryURLObj.get("authCode") || '';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>(OKENGINE);
  const { initialState, setInitialState } = useModel('@@initialState');

  const intl = useIntl();

  useEffect(() => {
    (async () => {
      if (!authcode) {
        return false
      }

      try {
        // 登录
        const response = await login({ authcode, type });
        console.log('登录请求后', response);
        if (response.code === 0) {
          // 先设置token
          window.localStorage.setItem('token', response.data.token);
  
          await fetchUserInfo(); // 获取用户信息需要token
  
          const result = await getChains();
          let finalChain = [];
          if ( result.code === 0) {
              console.log('login page getChains', result.data);
              finalChain = result.data.map((item: any) => {
                  return {
                      id: item.chain_id,
                      token: item.token,
                      label: item.name,
                      rpcUrl: item.rpc,
                  }
              });
          }
          localStorage.setItem('GLOBAL_CHAINS', JSON.stringify(finalChain));
          
          const defaultLoginSuccessMessage = intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: '登录成功！',
          });
          message.success(defaultLoginSuccessMessage);
  
          // console.log(initialState);
          // return false
  
          
          /** 此方法会跳转到 redirect 参数所在的位置 */
          if (!history) return;
  
          const query = parse(history.location.search ? history.location.search.substr(1) : history.location.search);
          const { redirect } = query as { redirect: string };
  
          // const { query = {}, search, pathname } = history.location;
  
          console.log('跳转前', query, redirect);
          // 跳转
          if (redirect) {
            console.log('进到redirect');
            // history.push(redirect);
            window.location.href = redirect;
          } else {
            console.log('//////');
            // history.push('/');
            window.location.href = '/'
          }
          return;
        } else if (response.code === 403) {
          //TODO
          message.error('登录已超时，请重新登录。');
        } else {
          message.error('登录失败，原因：' + response.msg);
        }
        // 如果失败去设置用户错误信息
        setUserLoginState(response);
      } catch (error) {
        const defaultLoginFailureMessage = intl.formatMessage({
          id: 'pages.login.failure',
          defaultMessage: '登录失败，请重试！',
        });
        message.error(defaultLoginFailureMessage);
      }
    })()
  }, []);

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      await setInitialState((s: any) => ({
        ...s,
        currentUser: userInfo,
      }));
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    console.log('提交参数：', type, values);

    if (type === OKENGINE) {
      if (authcode) {
        message.warning("Loading进行中，请等待...")
        return false
      }
      const redirectClientURL = `${location.protocol}//${location.hostname}:${location.port}/user/login`;
      // 发请求
      request.post(`${rootAPIURL}/login_url`, {
        data: { redirecturi : redirectClientURL},
      })
      .then(function(response) {
        if (response.code === 0) {
          // 重定向
          window.location.href = response.data.url
        } else {
          message.error('提交失败，原因：' + response.msg);
        }
      })
      .catch(function(error) {
        console.log(error);
      });
    } else {
      try {
        // 登录
        const response = await login({ ...values, type });
        console.log('登录请求后', response);
        if (response.code === 0) {
          // 先设置token
          window.localStorage.setItem('token', response.data.token);
  
          await fetchUserInfo(); // 获取用户信息需要token
  
          const result = await getChains();
          let finalChain = [];
          if ( result.code === 0) {
              console.log('login page getChains', result.data);
              finalChain = result.data.map((item: any) => {
                  return {
                      id: item.chain_id,
                      token: item.token,
                      label: item.name,
                      rpcUrl: item.rpc,
                  }
              });
          }
          localStorage.setItem('GLOBAL_CHAINS', JSON.stringify(finalChain));
          
          const defaultLoginSuccessMessage = intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: '登录成功！',
          });
          message.success(defaultLoginSuccessMessage);
  
          // console.log(initialState);
          // return false
  
          
          /** 此方法会跳转到 redirect 参数所在的位置 */
          if (!history) return;
  
          const query = parse(history.location.search ? history.location.search.substr(1) : history.location.search);
          const { redirect } = query as { redirect: string };
  
          // const { query = {}, search, pathname } = history.location;
  
          console.log('跳转前', query, redirect);
          // 跳转
          if (redirect) {
            console.log('进到redirect');
            // history.push(redirect);
            window.location.href = redirect;
          } else {
            console.log('//////');
            // history.push('/');
            window.location.href = '/'
          }
          return;
        } else if (response.code === 403) {
          //TODO
          message.error('登录已超时，请重新登录。');
        } else {
          message.error('登录失败，原因：' + response.msg);
        }
        // 如果失败去设置用户错误信息
        setUserLoginState(response);
      } catch (error) {
        const defaultLoginFailureMessage = intl.formatMessage({
          id: 'pages.login.failure',
          defaultMessage: '登录失败，请重试！',
        });
        message.error(defaultLoginFailureMessage);
      }
    }
  };
  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <div className={styles.lang} data-lang>
        {/* {SelectLang && <SelectLang />} */}
      </div>
      <div className={styles.content}>
        <LoginForm
          logo={<img alt="logo" src="/logo.svg" />}
          title="Web3 DevOps"
          subTitle={intl.formatMessage({
            id: 'pages.layouts.userLayout.title',
          })}
          initialValues={{
            autoLogin: true,
          }}
          actions={[
            // <FormattedMessage
            //   key="loginWith"
            //   id="pages.login.loginWith"
            //   defaultMessage="其他登录方式"
            // />,
            // <AlipayCircleOutlined
            //   key="AlipayCircleOutlined"
            //   className={styles.icon}
            // />,
            // <TaobaoCircleOutlined
            //   key="TaobaoCircleOutlined"
            //   className={styles.icon}
            // />,
            // <WeiboCircleOutlined
            //   key="WeiboCircleOutlined"
            //   className={styles.icon}
            // />,
          ]}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs activeKey={type} onChange={setType}>
            <Tabs.TabPane
              key="account"
              tab={intl.formatMessage({
                id: 'pages.login.accountLogin.tab',
                defaultMessage: '账户密码登录',
              })}
            />
            <Tabs.TabPane
              key="okengine"
              tab={intl.formatMessage({
                id: 'pages.login.okengine.tab',
                defaultMessage: 'OKEngine登录',
              })}
            />
            {/* <Tabs.TabPane
              key="mobile"
              tab={intl.formatMessage({
                id: 'pages.login.phoneLogin.tab',
                defaultMessage: '手机号登录',
              })}
            /> */}
          </Tabs>

          {status === 'error' && loginType === 'account' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误(admin/ant.design)',
              })}
            />
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '请输入您的okg.com邮箱（完整）',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '请输入密码',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
            </>
          )}

          {status === 'error' && loginType === 'mobile' && (
            <LoginMessage content="验证码错误" />
          )}
          {type === OKENGINE && (
            authcode ? <div style={{ paddingBottom: "50px"}}><Spin size="large" /> &nbsp;&nbsp; Loading进行中，请等待...</div>
            : <div style={{ paddingBottom: "50px"}}>点击登录按钮，会自动跳转到OKEngine登陆页。</div>
          )}
          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined className={styles.prefixIcon} />,
                }}
                name="mobile"
                placeholder={intl.formatMessage({
                  id: 'pages.login.phoneNumber.placeholder',
                  defaultMessage: '手机号',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="请输入手机号！"
                      />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="手机号格式错误！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.captcha.placeholder',
                  defaultMessage: '请输入验证码',
                })}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${intl.formatMessage({
                      id: 'pages.getCaptchaSecondText',
                      defaultMessage: '获取验证码',
                    })}`;
                  }
                  return intl.formatMessage({
                    id: 'pages.login.phoneLogin.getVerificationCode',
                    defaultMessage: '获取验证码',
                  });
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.captcha.required"
                        defaultMessage="请输入验证码！"
                      />
                    ),
                  },
                ]}
                onGetCaptcha={async (phone) => {
                  const result = await getFakeCaptcha({
                    phone,
                  });
                  if (result === false) {
                    return;
                  }
                  message.success('获取验证码成功！验证码为：1234');
                }}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            {/* <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage
                id="pages.login.rememberMe"
                defaultMessage="自动登录"
              />
            </ProFormCheckbox> */}
            <a
              style={{
                float: 'right',
              }}
            >
              {type === 'account' && <FormattedMessage
                id="pages.login.forgotPassword"
                defaultMessage="忘记密码？请联系管理员重置"
              />}
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
