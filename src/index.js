import React from 'react';
import ReactDOM from 'react-dom'
import { ConfigProvider } from 'antd';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/lib/locale/zh_CN';
// import 'antd/dist/antd.css';
// 可以修改主题色
import 'antd/dist/antd.less'

// 导入组件
import Task from './pages/Task'

// 导入公共样式
import './assets/reset.min.css';
import './assets/common.less'

ReactDOM.render(<ConfigProvider locale={zhCN}>
  <Task></Task>
</ConfigProvider>, document.getElementById('root'))