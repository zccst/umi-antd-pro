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
      name: 'dashboard',
      icon: 'InboxOutlined',
      path: '/dashboard',
      routes: [
        {
          path: '/dashboard',
          redirect: '/dashboard/workplace',
        },
        {
          name: 'workplace',
          icon: 'smile',
          path: '/dashboard/workplace',
          component: './dashboard/workplace',
        },
      ],
    },
    {
      name: 'common-module',
      icon: 'TeamOutlined',
      path: '/common-module',
      routes: [
        {
          path: '/common-module',
          redirect: '/common-module/chain',
        },
        {
          name: 'chain',
          icon: 'smile',
          path: '/common-module/chain',
          component: './common-module/chain',
        },
      ],
    },
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
      name: 'no-privatekey',
      icon: 'BgColorsOutlined',
      path: '/no-privatekey',
      routes: [
        {
          path: '/no-privatekey',
          redirect: '/no-privatekey/send',
        },
        {
          name: 'send',
          icon: 'smile',
          path: '/no-privatekey/send',
          component: './no-privatekey/send',
        },
        {
          name: 'mytaskapproval',
          icon: 'smile',
          path: '/no-privatekey/myTaskApproval',
          component: './no-privatekey/myTaskApproval',
        },
        {
          name: 'history',
          icon: 'smile',
          path: '/no-privatekey/history',
          component: './no-privatekey/history',
        },
        {
          name: 'approvallist',
          icon: 'smile',
          path: '/no-privatekey/approvallist',
          component: './no-privatekey/approvalList',
        },
        {
          name: 'privilegelist',
          icon: 'smile',
          path: '/no-privatekey/privilegelist',
          component: './no-privatekey/privilegeList',
        },
        {
          name: 'contractlist',
          icon: 'smile',
          path: '/no-privatekey/contractlist',
          component: './no-privatekey/contractList',
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
          name: 'project',
          icon: 'smile',
          path: '/contract/project',
          component: './contract/call/project',
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
        // {
        //   name: 'chain',
        //   icon: 'smile',
        //   path: '/contract/chain',
        //   component: './contract/call/chain',
        // },
        {
          name: 'call',
          icon: 'smile',
          path: '/contract/call',
          component: './contract/call',
        },
      ],
    },
    {
      name: 'new-deploy',
      icon: 'DeploymentUnitOutlined',
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
      name: 'batch-airdrop',
      icon: 'BgColorsOutlined',
      path: '/batch-airdrop',
      routes: [
        {
          path: '/batch-airdrop',
          redirect: '/batch-airdrop/send',
        },
        {
          name: 'erc20',
          icon: 'smile',
          path: '/batch-airdrop/erc20',
          component: './batch-airdrop/erc20',
        },
        {
          name: 'contract',
          icon: 'smile',
          path: '/batch-airdrop/contract',
          component: './batch-airdrop/contract',
        },
        {
          name: 'send',
          icon: 'smile',
          path: '/batch-airdrop/send',
          component: './batch-airdrop/send',
        },
        {
          name: 'history',
          icon: 'smile',
          path: '/batch-airdrop/history',
          component: './batch-airdrop/history',
        },
      ],
    },
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
      path: '/',
      redirect: '/dashboard',
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
