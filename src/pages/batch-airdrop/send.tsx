import {
  useAccountCenter,
  useConnectWallet,
  useNotifications,
  useSetChain,
  useWallets,
} from '@web3-onboard/react'
import {
  initWeb3Onboard,
  ethMainnetGasBlockPrices,
  infuraRPC
} from '../contract/call/services'
import '../contract/call/wallet-customized.css'
import { ethers } from 'ethers'

import { ActionType, ProColumns } from '@ant-design/pro-components';
import { GridContent, ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Form, Input, Modal, Spin, Radio, Space, Select, Popconfirm, Tooltip, message, Alert, Tag, Upload } from 'antd';
import { EllipsisOutlined, PlusOutlined, MinusCircleOutlined, QuestionCircleOutlined, SearchOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import { Suspense, useState, useEffect, useRef } from 'react';
import { history, useModel, Link } from 'umi';
import request from '../../utils/req';
import { batchAirdropUrlPrefix, LOGINPATH, AIRDROP_TYPE_LIST } from '../../utils/constant'

import { getChains } from '@/services/ant-design-pro/api';

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

interface CollectionCreateFormProps {
  open: boolean;
  confirmLoading: boolean;
  extraObj: {[key: string]: any};
  onCreate: (type: string, values: AirdropItem) => void;
  onCancel: () => void;
}


const CollectionCreateForm: React.FC<CollectionCreateFormProps> = ({
  open,
  confirmLoading,
  extraObj,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();

  const [currAirdropType, setCurrAirdropType] = useState('erc20_same_num');
  const title = "创建";

  const defaultV = {
    name: form.getFieldValue('name') || "",
    network_id: form.getFieldValue('network_id') || '',
    airdrop_type: form.getFieldValue('airdrop_type') || '',
    erc20_id: form.getFieldValue('erc20_id') || "",
    max_address_num: form.getFieldValue('max_address_num') || "",
    airdrop_contract_id: form.getFieldValue('airdrop_contract_id') || "",
  }
  // 只创建，不修改
  // console.log('defaultV', extraObj, defaultV);

  setTimeout(() => {
    form.setFieldsValue(defaultV);
  }, 10);

  const onAirdropSelect = (airdrop_type: any) => {
    setCurrAirdropType(airdrop_type)
    form.setFieldsValue({airdrop_type: airdrop_type});
  }

  const onLocalCancel = () => {
    form.resetFields();
    onCancel();
  }

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  }
  const beforeUpload = async (file: any) => {
    console.log('beforeUpload', file.name);
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
            console.log('File对象' , values['csv'][0].originFileObj);
            const reader = new FileReader();
            reader.readAsText(values['csv'][0].originFileObj);
            reader.onload = () => {
              const cont = typeof reader.result === 'string' ? reader.result : reader.result?.toString()
              values['csv_name'] = values['csv'][0].originFileObj.name
              values['csv'] = cont
              onCreate(extraObj.type, values);
            };
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 17 }}
        name="form_in_modal"
        // initialValues={defaultV}
      >
        <Form.Item hidden={true} name="id"><Input /></Form.Item>
        <Form.Item hidden={true} name="create_time"><Input /></Form.Item>
        <Form.Item hidden={true} name="update_time"><Input /></Form.Item>

        <Form.Item
          name="name"
          label="空投名称"
          rules={[{ required: true, message: '请输入空投名称！' }]}
        >
          <Input placeholder="空投名称" />
        </Form.Item>
        <Form.Item 
          label="所属网络"
          name="network_id"
          rules={[{ required: true, message: '请选择所属网络！' }]}
        >
          <Select 
            disabled={(extraObj.type === 'edit') ? true : false}
            options={extraObj.chainFormOptions}
          >
          </Select>
        </Form.Item>
        <Form.Item 
          label="空投类型"
          name="airdrop_type"
          rules={[{ required: true, message: '请选择空投类型！' }]}
        >
          <Select 
            disabled={(extraObj.type === 'edit') ? true : false}
            options={AIRDROP_TYPE_LIST}
            onSelect={onAirdropSelect}
          >
          </Select>
        </Form.Item>

        {
          (currAirdropType === 'erc20_same_num' || currAirdropType === 'native_same_num')
          ? <Form.Item
              name="value_per_address"
              label="空投数量"
            >
              <Input placeholder="请输入空投数量！数量相同，需要填写；数量不同，则不需要填写" />
            </Form.Item>
          : null
        }

        {
          (currAirdropType === 'erc20_same_num' || currAirdropType === 'erc20_diff_num')
          ? <Form.Item 
              label="空投ERC20代币"
              name="erc20_id"
            >
              <Select 
                disabled={(extraObj.type === 'edit') ? true : false}
                options={extraObj.erc20FormOptions}
              >
              </Select>
            </Form.Item>
          : null
        }
        
        <Form.Item
          name="csv"
          label="csv文件"
          rules={[{ required: true, message: '请上传csv文件！' }]}
          valuePropName="fileList"
          getValueFromEvent={normFile}
          extra="如果上传多个keystore文件，以第一个为准"
        >
          <Upload name="content" action="/upload.do" beforeUpload={beforeUpload} listType="text">
            <Button icon={<UploadOutlined />}>点击上传</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          name="max_address_num"
          label="单笔交易最大地址数"
          rules={[{ required: true, message: '请输入单笔交易最大地址数！' }]}
        >
          <Input placeholder="请输入单笔交易最大地址数！" />
        </Form.Item>
        <Form.Item 
          label="选择空投合约"
          name="airdrop_contract_id"
          rules={[{ required: true, message: '请选择空投合约！' }]}
        >
          <Select 
            disabled={(extraObj.type === 'edit') ? true : false}
            options={extraObj.airdropContractFormOptions}
          >
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

let provider : any

const SendAirdrop: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const { initialState } = useModel('@@initialState');


  const [{ wallet }, connect, disconnect] = useConnectWallet(); // 钱包
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain(); // 链
  const [notifications, customNotification, updateNotify] = useNotifications(); // 通知
  const connectedWallets = useWallets(); // 已连接钱包，是数组
  const updateAccountCenter = useAccountCenter(); // 用户中心
  const [web3Onboard, setWeb3Onboard] = useState<{[key: string]: any}>({});

  // 发空投loading
  const [loading, setLoading] = useState(false)
  const [currId, setCurrId] = useState(0)


  const [open, setOpen] = useState(false);
  // const [modalItem, setModalItem] = useState<{[key: string]: any}>({});
  const [extraObj, setExtraObj] = useState({type: '', item: {}, chainFormOptions:[], erc20FormOptions: [], airdropContractFormOptions: []});
  const [confirmLoading, setConfirmLoading] = useState(false);

  // show detail
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailArr, setDetailArr] = useState([]);


  const [chainListFromServer, setChainListFromServer] = useState([]);
  const [erc20ListFromServer, setErc20ListFromServer] = useState([]);
  const [airdropContractListFromServer, setAirdropContractListFromServer] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await getChains();
      let finalChain = [];
      if ( result.code === 0) {
        // console.log('erc20 page getChains', result.data);
        finalChain = result.data.map((item: any) => {
          return {
            chain_id: item.chain_id,
            id: item.id,
            token: item.token,
            label: item.name,
            value: item.id,
            rpcUrl: item.rpc,
          }
        });
      }
      setChainListFromServer(finalChain)
    })()

    // erc20 list
    request
      .get(batchAirdropUrlPrefix + "/erc20/list?current=1")
      .then(function(response) {
        if (response.code === 0) {
          const data = (response.data && response.data.list) ? response.data.list : [];
          const targetArr = data.map((item: any) => {
            return {
              value: '' + item.id,
              label: item.name,
              id: item.id,
              address: item.address,
              abi: item.abi,
            }
          });
          // console.log('/erc20/list?current=1', targetArr);
          setErc20ListFromServer(targetArr);
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


    // airdrop contract list
    request
      .get(batchAirdropUrlPrefix + "/contract/list?current=1")
      .then(function(response) {
        if (response.code === 0) {
          const data = (response.data && response.data.list) ? response.data.list : [];
          const targetArr = data.map((item: any) => {
            return {
              value: '' + item.id,
              label: item.name,
              id: item.id,
              address: item.address,
              abi: item.abi,
            }
          });
          // console.log('/contract/list?current=1', targetArr);
          setAirdropContractListFromServer(targetArr);
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
  }, []);

  useEffect(() => {
    setWeb3Onboard(initWeb3Onboard);
    updateAccountCenter({ minimal: false })
    return () => { // 处理已登录的面板
      updateAccountCenter({ minimal: true })
    }
  }, [])
  
  useEffect(() => {
      if (!connectedWallets.length) return
  
      const connectedWalletsLabelArray = connectedWallets.map(
        ({ label }) => label
      )
      // Check for Magic Wallet user session
      if (connectedWalletsLabelArray.includes('Magic Wallet')) {
        const [magicWalletProvider] = connectedWallets.filter(
          provider => provider.label === 'Magic Wallet'
        )
        async function setMagicUser() {
          try {
              const { email } = await magicWalletProvider.instance.user.getMetadata()
              const magicUserEmail = localStorage.getItem('magicUserEmail')
              if (!magicUserEmail || magicUserEmail !== email)
              localStorage.setItem('magicUserEmail', email)
          } catch (err) {
            throw err
          }
        }
        setMagicUser()
      }
  }, [connectedWallets, wallet])
  
  useEffect(() => {
      if (!wallet?.provider) {
        provider = null
      } else {
        provider = new ethers.providers.Web3Provider(wallet.provider, 'any')
      }
  }, [wallet])


  const onCreate = (type: any, values: any) => {
    // console.log(initialState.currentUser);
    console.log('Received values of form: ', values);
    const urlObj: any = {
      'new': '/create',
      'edit': '/update',
    };
    const newParam = {
      name: values['name'],
      network_id: +values['network_id'],
      airdrop_type: values['airdrop_type'],
      erc20_id: +values['erc20_id'],
      value_per_address: +values['value_per_address'],
      csv: values['csv'],
      csv_name: values['csv_name'],
      max_address_num: +values['max_address_num'],
      airdrop_contract_id: +values['airdrop_contract_id'],
    }
    
    const param = newParam
    console.log(param, values);
    // return;
    setConfirmLoading(true);
    request.post(`${batchAirdropUrlPrefix}/task${urlObj[type]}`, {
      data: param,
    })
      .then(function(response) {
        if (response.code === 0) {
          message.success('提交成功！')
          // window.location.reload();
          actionRef.current?.reload();
        } else if (response.code === 403) {
          //TODO
          message.error('登录已超时，请重新登录。');
          history.push(LOGINPATH);
        } else {
          message.error('提交失败，原因：' + response.msg)
        }
        setOpen(false);
        setConfirmLoading(false);
      })
      .catch(function(error) {
        console.log(error);
        setConfirmLoading(false);
      });
  };

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

  

  const onAlertClose = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log(e, 'I was closed.');
  };

  // 更新hash。用于发送交易后，记录hash到数据库。
  const _update_hash = (id: any, txHash: any) => {
    request.post(`${batchAirdropUrlPrefix}/task/update_hash`, {
      data: { id : id, tx_hash: txHash},
    })
    .then(function(response) {
      if (response.code === 0) {
        message.success('更新hash成功！');
        actionRef.current?.reload();
      } else if (response.code === 403) {
        //TODO
        message.error('登录已超时，请重新登录。');
        history.push(LOGINPATH);
      } else {
        message.error('提交失败，原因：' + response.msg);
      }
    })
    .catch(function(error) {
      console.log(error);
    });
  }

  // 更新状态。支持批量。ids=[1,2,3,...] status=1,2待确认,3成功,4失败,5无效
  const _update_status = (ids: any, status: any) => {
    request.post(`${batchAirdropUrlPrefix}/task/update`, {
      data: { ids : ids, status: +status},
    })
    .then(function(response) {
      if (response.code === 0) {
        message.success('更新状态成功！');
        actionRef.current?.reload();
      } else if (response.code === 403) {
        //TODO
        message.error('登录已超时，请重新登录。');
        history.push(LOGINPATH);
      } else {
        message.error('提交失败，原因：' + response.msg);
      }
    })
    .catch(function(error) {
      console.log(error);
    });
  }

  // 发空投
  const onSendClick = async(item: any) => {
    // 检查钱包连接情况
    if (!wallet) {
      const walletSelected = await connect()
      if (!walletSelected) {
        message.warning("请先连接钱包，再调用。");
        return false
      }
    }

    // 查看当前的链，与钱包中的链是否一致。如果不一致，则提示切换至与用户选择的链一致。
    let currChainId = ''
    chainListFromServer.map((chainObj: any, i) => {
      if (chainObj.id === item.network_id) {
        currChainId = chainObj.chain_id
      }
    })
    if (!currChainId) {
      message.warning("找不到对应网络，请先到导航菜单公共部分添加该网络。");
      return false
    }
    // console.log('检查链是否一致', connectedChain?.id, currChainId, connectedChain?.id !== currChainId);
    if (connectedChain?.id !== currChainId) {
      setChain({ chainId: currChainId });
    }

    setCurrId(item.id)
    setLoading(true)

    // 空投合约地址，from 创建时选择
    let currAirdropContractAddr = ''
    let currAirdropContractAbi = ''
    airdropContractListFromServer.map((airdropContractObj: any, i) => {
      if (airdropContractObj.id === item.airdrop_contract_id) {
        currAirdropContractAddr = airdropContractObj.address
        currAirdropContractAbi = airdropContractObj.abi
      }
    })
    if (!currAirdropContractAddr) {
      message.warning("请先到导航菜单添加，路径：批量发空投-空投合约管理。");
      return false
    }

    // 空投地址和数量
    if (!item.address_list.length) {
      message.warning('无法发空投，暂时没有接收地址。');
      return false;
    }
    let toAddrs: any = []
    let toNums: any = []
    let totalNum = 0
    item.address_list.map((toObj: any) => {
      for ( let key in toObj) {
        if (toObj.hasOwnProperty(key)) {
          toAddrs.push(key)
          toNums.push(+toObj[key])
          totalNum += +toObj[key]
        }
      }
    })

    // 发请求
    const signer = provider.getUncheckedSigner();
    const finalAirdropContractAbi = JSON.parse(currAirdropContractAbi).abi
    
    if (item.airdrop_type === 'erc20_same_num' || item.airdrop_type === 'erc20_diff_num') {
      // 当前erc20 token合约地址
      let currErc20ContractAddr = ''
      let currErc20ContractAbi = ''
      erc20ListFromServer.map((erc20Obj: any, i) => {
        if (erc20Obj.id === item.erc20_id) {
          currErc20ContractAddr = erc20Obj.address
          currErc20ContractAbi = JSON.parse(erc20Obj.abi).abi
        }
      })

      // 查看erc20授权给空投合约地址授权数量，如果余额不足，则再次授权
      try {
        // 还原erc20合约：合约地址，signer, provider
        const erc20Contract = new ethers.Contract(currErc20ContractAddr, currErc20ContractAbi, signer);
        const allowed_num = await erc20Contract.allowance(wallet?.accounts[0].address, currAirdropContractAddr);
        const readable_allowed_num = +allowed_num.toString()
        console.log('readable_allowed_num', readable_allowed_num);
        console.log(readable_allowed_num, totalNum, readable_allowed_num < totalNum)
        if (readable_allowed_num < totalNum) {
          message.info("当前授权余额不足，需要对空投合约再次授权")
          const approveTx = await erc20Contract.approve(currAirdropContractAddr, totalNum);
          console.log('approveTx', approveTx);
          // TODO 等待
          await approveTx.wait();
          const approveRecepit = await provider.getTransactionReceipt(approveTx.hash)
          console.log('approveRecepit', approveRecepit);
          if (!approveRecepit) {
            message.error('approve尚未被处理或已失败')
            setLoading(false)
            return false
          }
        }
      } catch (exception: any) {
        console.log('try catch', exception, typeof exception);
        message.error(JSON.stringify(exception))
        setLoading(false)
      }

      // 还原空投合约：合约地址，signer, provider
      try {
        const contract = new ethers.Contract(currAirdropContractAddr, finalAirdropContractAbi, signer);
        // const res = await (contract as any).batchTransferERC20(...paramsValue);
        const tx = await contract.batchTransferERC20(currErc20ContractAddr, toAddrs, toNums);
        console.log('tx', tx, tx.hash)
        message.info('交易已发送，hash是：' + tx.hash)
        _update_status([item.id], 2) // 已发送，待确认
        _update_hash(item.id, tx.hash);

        // TODO 等待
        await tx.wait();
        const recepit = await provider.getTransactionReceipt(tx.hash)
        setLoading(false)
        console.log('erc20代币 recepit', recepit);
        if (recepit) {
          message.info('上链已成功，交易hash：' + recepit.transactionHash)
          _update_status([item.id], 3) // 已成功，已确认
        } else {
          message.error('交易尚未被处理或已失败')
          _update_status([item.id], 4) // 已失败
        }
      } catch (exception: any) {
        setLoading(false)
        console.log('try catch', exception, typeof exception)
        message.error(JSON.stringify(exception))
      }
    } else if (item.airdrop_type === 'native_same_num' || item.airdrop_type === 'native_diff_num') {
      // 还原空投合约：合约地址，signer, provider
      try {
        const contract = new ethers.Contract(currAirdropContractAddr, finalAirdropContractAbi, signer);
        // const res = await (contract as any).batchTransferERC20(...paramsValue);
        const tx = await contract.batchTransfer(toAddrs, toNums, {
          value: totalNum,
        });
        console.log('tx', tx, tx.hash)
        message.info('交易已发送，hash是：' + tx.hash)
        _update_status([item.id], 2) // 已发送
        _update_hash(item.id, tx.hash);

        // TODO 等待
        await tx.wait();
        const recepit = await provider.getTransactionReceipt(tx.hash)
        setLoading(false)
        console.log('原生代币 recepit', recepit);
        if (recepit) {
          message.info('上链已成功，交易hash：' + recepit.transactionHash)
          _update_status([item.id], 3) // 已成功
        } else {
          message.error('交易尚未被处理或已失败')
          _update_status([item.id], 4) // 已失败
        }
      } catch (exception: any) {
        setLoading(false)
        console.log('try catch', exception, typeof exception);
        message.error(JSON.stringify(exception))
      }
    }
    
    
  };

  // 检查状态
  const onCheckAndUpdateStatus = async(item: any) => {
    if (!item.tx_hash) {
      message.warning("tx_hash为空，请先发交易再查上链状态");
      return false
    }
    const recepit = await provider.getTransactionReceipt(item.tx_hash)
    // const recepit = await provider.waitForTransaction(item.tx_hash, 1)
    console.log('onCheckAndUpdateStatus recepit', recepit);
    if (recepit) {
      message.info('上链已成功，交易hash：' + recepit.transactionHash)
      _update_status([item.id], 3) // 已成功
    } else {
      message.error('交易尚未被处理或已失败')
      // _update_status([item.id], 4) // 已失败
    }
    actionRef.current?.reload();
  }


  // 置为无效
  const onSetInvalid = (id: any) => {
    console.log('onSetInvalid', id);
    _update_status([id], 5)
  };



  // 表格的列
  const columns: ProColumns<AirdropItem>[] = [
    {
      title: '分组',
      width: '50px',
      key: 'group_id',
      dataIndex: 'group_id',
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
      hideInSearch: true, // 在查询表单中不展示此项
      render: (text, record, _, action)=> {
        let retStr = ""
        AIRDROP_TYPE_LIST.map((item, index) => {
          if (item.value === record.airdrop_type) {
            retStr = item.label
          }
        })
        return retStr
      },
    },
    {
      title: '单笔交易最大地址数',
      key: 'max_address_num',
      dataIndex: 'max_address_num',
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '创建时间',
      key: 'update_time',
      dataIndex: 'update_time',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true, // 在查询表单中不展示此项
    },
    {
      title: '状态',
      width: '100px',
      key: 'status',
      dataIndex: 'status',
      ellipsis: true,
      hideInSearch: true, // 在查询表单中不展示此项
      render: (text, record, _, action)=> {
        const statusArr = ['', '未发放', '待确认', '发放成功', '发放失败', '无效']
        return (loading && record.id === currId) ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /> : statusArr[record.status]
      },
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
      width: '240px',
      valueType: 'option',
      key: 'option',
      render: (text, record, _, action) => [
        <a key='detail' onClick={() => showDetail(record.address_list)}>
          空投详情
        </a>,
        <a key='send' disabled={loading && record.id === currId} onClick={() => onSendClick(record)}>
          发放
        </a>,
        <a key='updateStatus' onClick={() => onCheckAndUpdateStatus(record)}>
          查看状态
        </a>,
        <Popconfirm key="delete" title="确定要置为无效吗" onConfirm={() => onSetInvalid(record.id)}>
          <a>置为无效</a>
        </Popconfirm>,
      ],
    },
  ];

  return <GridContent>
    <>
      {Object.keys(web3Onboard).length ? <section >
          <Alert
              message="发空投步骤："
              description="1.新建 -> 2.连接钱包 -> 3. 按分组发放 -> 4.查看发放状态。"
              type="info"
              closable
              showIcon
              onClose={onAlertClose}
              />
          <div className='user-info-basic'>
              <div className='header-align-left'></div>
              <div className='header-align-right'>
                  {!wallet && (
                  <Button style={{width: 102}}
                      onClick={async () => {
                      const walletsConnected = await connect()
                      console.log('connected wallets: ', walletsConnected)
                      }}
                  >
                      连接钱包
                  </Button>
                  )}
                  {wallet && (<Button style={{width: 102}}
                      onClick={async () => {
                          const walletsConnected = await disconnect(wallet)
                          console.log('connected wallets: ', walletsConnected)
                          window.localStorage.removeItem('connectedWallets')
                      }}
                  >
                      断开钱包
                  </Button>
                  )}
              </div>
          </div>
      </section>
      :
      <div>Loading...</div>
      }
      <ProTable<AirdropItem>
        columns={columns}
        actionRef={actionRef} // Table action 的引用，便于自定义触发
        cardBordered  // Table 和 Search 外围 Card 组件的边框
        request={async (params = {}, sort, filter) => {
          console.log('params', params, sort, filter);
          let ret: any = {};
          await request<{
            data: AirdropItem[];
          }>(`${batchAirdropUrlPrefix}/task/list`, {
            params,
          }).then(r => ret = r);

          // console.log('ret', ret, typeof ret);

          if (ret.code === 403) {
            //TODO
            message.error('登录已超时，请重新登录。');
            history.push(LOGINPATH);
          } else if (ret.code !== 0) {
            message.error('获取链列表失败，原因：' + ret.msg)
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
        search={false} // 是否显示搜索表单，false | SearchConfig 传入对象时为搜索表单的配置
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
        headerTitle="发空投列表"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              // actionRef.current?.reload();
              setOpen(true);
              setExtraObj({
                type: 'new',
                item: {},
                chainFormOptions: chainListFromServer,
                erc20FormOptions: erc20ListFromServer,
                airdropContractFormOptions: airdropContractListFromServer,
              });
            }}
            type="primary"
          >
            新建
          </Button>,
        ]}
      />

      <Modal title="查看空投详情" width={600} open={isDetailModalOpen} onOk={handleDetailOk} onCancel={handleDetailCancel}>
        <table style={{width : '100%'}}>
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

      <CollectionCreateForm
        open={open}
        confirmLoading={confirmLoading}
        extraObj={extraObj}
        onCreate={onCreate}
        onCancel={() => {
          setOpen(false);
        }}
      />

    </>
  </GridContent>;
};


export default SendAirdrop;
