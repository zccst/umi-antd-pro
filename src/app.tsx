import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';

// import { PageLoading } from '@ant-design/pro-layout';没有安装这个插件
import PageLoading from '@/components/PageLoading'; // 自己直接用源码写一个

import type { RunTimeLayoutConfig } from 'umi';
import { history, Link } from 'umi';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
import { message } from 'antd';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

// initialStateConfig 是 getInitialState 的补充配置，
// getInitialState 支持异步的设置，在初始化没有完成之前我们展示了一个 loading，initialStateConfig 可以配置这个 loading。
/** 获取用户信息比较慢的时候会展示一个 loading */
// export const initialStateConfig = {
//   loading: <PageLoading />,
// };

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  // 此处仅定义函数，未执行
  const fetchUserInfo = async () => {
    try {
      const response = await queryCurrentUser();
      if (response.code === 0) {
        return { ...response.data, avatar: 'https://img.duoziwang.com/2021/04/08260845109948.jpg'};
      } else if (response.code === 403) {
        history.push(loginPath);
      } else {
        message.error('获取用户信息失败，原因：' + response.msg);
        history.push(loginPath);
      }
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果是登录页面，不执行
  console.log('app页的history.location.pathname' , history.location.pathname);
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo(); // 不是登录页才执行调用
    console.log('getInitialState 除登录页之外的所有页面 currentUser:', currentUser);
    return {
      fetchUserInfo,
      currentUser,
      settings: { layout: 'mix', logo: 'https://static.okx.com/cdn/assets/imgs/237/524AC4AEC70BD408.svg' },
    };
  }
  return {
    fetchUserInfo,
    settings: { layout: 'mix', logo: 'https://static.okx.com/cdn/assets/imgs/237/524AC4AEC70BD408.svg' },
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    links: [],
    // isDev
    //   ? [
    //       <Link to="/umi/plugin/openapi" target="_blank">
    //         <LinkOutlined />
    //         <span>OpenAPI 文档</span>
    //       </Link>,
    //       <Link to="/~docs">
    //         <BookOutlined />
    //         <span>业务组件文档</span>
    //       </Link>,
    //     ]
    //   : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {/* 隐藏设置 */}
          {/* {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )} */}
        </>
      );
    },
    ...initialState?.settings,
  };
};
