// 网络状态显示，freeze不可修改

const networkEnum = Object.freeze({
  '0x1': 'Ethereum Main',
  '0x38': 'BSC',
  '0x89': 'Polygon',
  '0xfa': 'Fantom',
  localhost: 'localhost'
});
export default networkEnum;
