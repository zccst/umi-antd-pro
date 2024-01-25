// https://umijs.org/config/
import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin';
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
const { REACT_APP_ENV } = process.env;

export default defineConfig({
  hash: true,
  model: {},
  antd: {},
  request: {},
  access: {}, // 开启
  initialState: {},
  mock: {
    include: ['src/pages/**/_mock.ts'],
  },
  dva: {
    // hmr: true,
  },
  // srcTranspiler: 'esbuild', // dev时
  jsMinifier: 'terser', // build时
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  // dynamicImport: {
  //   loading: '@ant-design/pro-components/es/PageLoading',
  // },
  targets: {
    // TODO: vite mode don't support ie 11
    // ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/user',
      layout: false,
      routes: [
        {
          path: '/user/login',
          layout: false,
          name: 'login',
          component: './user/Login',
        },
        {
          path: '/user',
          redirect: '/user/login',
        },
        {
          name: 'register-result',
          icon: 'smile',
          path: '/user/register-result',
          component: '@/pages/user/register-result',
        },
        {
          name: 'register',
          icon: 'smile',
          path: '/user/register',
          component: './user/register',
        },
        {
          component: '404',
        },
      ],
    },
    /**
     *
    {
      name: 'exception',
      icon: 'warning',
      path: '/exception',
      routes: [
        {
          path: '/exception',
          redirect: '/exception/403',
        },
        {
          name: '403',
          icon: 'smile',
          path: '/exception/403',
          component: './exception/403',
        },
        {
          name: '404',
          icon: 'smile',
          path: '/exception/404',
          component: './exception/404',
        },
        {
          name: '500',
          icon: 'smile',
          path: '/exception/500',
          component: './exception/500',
        },
      ],
    },
     */
    {
      name: 'account',
      icon: 'user',
      path: '/account',
      routes: [
        {
          path: '/account',
          // redirect: '/account/center',
          redirect: '/account/password',
        },
        /*{
          name: 'center',
          icon: 'smile',
          path: '/account/center',
          component: '@/pages/account/center',
        },*/
        {
          name: 'settings',
          icon: 'smile',
          path: '/account/settings',
          component: './account/settings',
        },
        {
          name: 'password',
          icon: 'smile',
          path: '/account/password',
          component: './account/password',
        },
        {
          name: 'users',
          icon: 'smile',
          access: 'canAdmin',
          path: '/account/users',
          component: './account/users',
        },
      ],
    },
    {
      name: 'contract',
      icon: 'MenuUnfoldOutlined',
      path: '/contract',
      routes: [
        {
          path: '/contract',
          redirect: '/contract/call',
        },
        {
          name: 'call',
          icon: 'smile',
          path: '/contract/call',
          component: './contract/call',
        },
        {
          name: 'abi',
          icon: 'smile',
          path: '/contract/abi',
          component: './contract/call/abi',
        },
        {
          name: 'address',
          icon: 'smile',
          path: '/contract/address',
          component: './contract/call/address',
        },
        {
          name: 'chain',
          icon: 'smile',
          path: '/contract/chain',
          component: './contract/call/chain',
        },
        {
          name: 'project',
          icon: 'smile',
          path: '/contract/project',
          component: './contract/call/project',
        },

      ],
    },
    {
      name: 'new-deploy',
      icon: 'MenuUnfoldOutlined',
      path: '/new-deploy',
      routes: [
        {
          path: '/new-deploy',
          redirect: '/new-deploy/task',
        },
        {
          name: 'keystore',
          icon: 'smile',
          path: '/new-deploy/keystore',
          component: './new-deploy/keystore',
        },
        {
          name: 'keyless',
          icon: 'smile',
          path: '/new-deploy/keyless',
          component: './new-deploy/keyless',
        },
        {
          name: 'factory',
          icon: 'smile',
          path: '/new-deploy/factory',
          component: './new-deploy/factory',
        },
        {
          name: 'task',
          icon: 'smile',
          path: '/new-deploy/task',
          component: './new-deploy/task',
        },
      ],
    },
    {
      path: '/',
      redirect: '/contract/call',
    },
    {
      component: '404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'root-entry-name': 'variable',
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  // esbuild: {},
  // title: false,
  ignoreMomentLocale: true,
  // @ts-ignore
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: true,
  mfsu: {
    // esbuild: true,
  },
  chainWebpack(memo: any) {
    memo.plugin('monaco-editor').use(MonacoEditorWebpackPlugin, []);
    return memo;
  },
  // openAPI: [
  //   {
  //     requestLibPath: "import { request } from 'umi'",
  //     // 或者使用在线的版本
  //     // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
  //     schemaPath: join(__dirname, 'oneapi.json'),
  //     mock: false,
  //   },
  //   {
  //     requestLibPath: "import { request } from 'umi'",
  //     schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
  //     projectName: 'swagger',
  //   },
  // ],
  // nodeModulesTransform: {
  //   type: 'none',
  // },
  // exportStatic: {},
  codeSplitting: {
    jsStrategy: 'granularChunks',
  },
  ui: {},
});
