import React, { Component } from 'react'
import './Task.less'
import api from '../api/index'
import moment from 'moment';
import { Button, Tag, Table, Modal, Input, DatePicker,message} from 'antd';
const { TextArea } = Input;
const { confirm} = Modal;
// 包含的东西多就用类组件

// 今天后一天
const NOWNEXT = moment(new Date(new Date().getTime() + (24 * 60 * 60 * 1000)));
export default class Task extends Component {
  state = {
    columns: [
      {
        width:'10%',
        title: '编号',
        dataIndex: '_id',
        key: ''
      },
      {
        width:'30%',
        title: '任务描述',
        render: text => {
          let { state, task } = text;
          return <>
            {
              parseInt(state) === 2 ? <div className="finish">{task}</div> : <div>{ task }</div>
            }
          </>
        }
      },
      {
        width:'20%',
        title: '时间',
        render: text => {
          let { time, complete, state } = text;
          // 根据状态选择显示哪个时间
          // if (state === 2) {
          //   // 完成
          //   time = complete;
          // }
          // 2021-08-18 18:00:00
          // ['2021','08','18' ...]
          let timeArr = time.match(/\d+/g);
          // 1,2,3,4 作为索引
          let template = '{1}-{2} {3}:{4}'
          time = template.replace(/\{(\d+)\}/g, (val, group1) => {
            let res = timeArr[group1] || '0';
            return res.length < 2 ? '0' + res : res;
          })
        
          if (state === 2) {
            let completeArr = complete.match(/\d+/g);
            // 1,2,3,4 作为索引
            complete = template.replace(/\{(\d+)\}/g, (val, group1) => {
              let res = completeArr[group1] || '0';
              return res.length < 2 ? '0' + res : res;
            })
          }

          return <>
            <p>{ time} <Tag color="volcano">预期</Tag></p>
            { state === 2 ? <p style={{marginTop:5}}>{ complete} <Tag color="lime">最终</Tag></p> : null}

          </>
        }
      },
      {
        width:'15%',
        title: '状态',
        dataIndex:'state',
        render: (text, record, index) => {
          // 如果没有dataIndex text === record
          // text 当前行的值 record 当前行数据 index 行索引
          return text === 1 ? <Tag color="#f50">未完成</Tag> :<Tag color="#87d068">已完成</Tag>
        }
      },
      {
        width:'18%',
        title: '操作',
        render: text => {
          let { state } = text;
          return <>
            <Button type="link" onClick={this.handleDelete.bind(this,text)}>删除</Button>
            { state === 1 ? <Button type="link" onClick={this.handleFinish.bind(this,text)}>完成</Button> : null}
          </>
        }
      },
    ],
    data: [
      {
        id: 1,
        task: '夫君子之行，静以修身，俭以养德，非宁静无以致远，非淡泊无以明志',
        state: 1, //未完成
        time: '2021-8-18 18:00:00',
        complete:'2021-8-15 18:00:00'
      }],
    // 模态框显示/隐藏
    visible: false,
    // table加载等待状态
    loading: false,
    // 控制输入内容
    task: '',
    time: NOWNEXT,
    // 控制页卡
    tagList: [{
      state: 0,
      text: '全部',
      selected:true
    },{
      state: 1,
      text: '未完成',
      selected:false
    },{
      state: 2,
      text: '已完成',
      selected:false
    }]
    
    
  }
  render () {
    let { columns,visible,data,loading,task,time,tagList} = this.state;
    return <section className="taskBox">
      <header className="headerBox">
        <h2>任务列表</h2>
        <Button type="primary" onClick={ev=>this.setState({visible:true})}>新增</Button>
      </header>
      <nav className="navBox" onClick={this.changeType}>
        {
          tagList.map(tag => (
            <Tag key={ tag.state } color={ tag.selected ? '#108ee9' : ''} state={ tag.state }>{tag.text}</Tag>
          ))
        }
      </nav>
      <Table columns={columns} dataSource={data} loading={loading} pagination={false} rowKey="_id"></Table>
      {/* 新增对话框 */}
      <Modal title="新增任务"
        className="modalBox"
        maskClosable={false}
        visible={visible}
        onOk={this.submit}
        onCancel={this.cancel}>
          <p>任务描述</p>
        <TextArea row={4} value={task} onInput={ev => {this.setState({task:ev.target.value})}}></TextArea>
          <p>预期完成时间</p>
          <DatePicker showTime onChange={ ev =>{this.setState({time:ev})}} value={time}></DatePicker>
      </Modal>
    </section>
  }
  handleDelete = text => {
    let { _id } = text;
    confirm({
      title: '这是一个危险操作',
      content: `确定要删除${_id}的信息吗？`,
      okType: 'danger',
      onOk: async () => {
        let res = await api.task.removeTask(_id);
        console.log(res)
        if (parseInt(res.code) === 0) {
          message.success('删除成功');
          this.cancel();
          // 重新获取指定状态下的数据
          let state = parseInt(localStorage.getItem('state') || 0);
          if (state !== 2) {
            // 不是已完成才拉取
            this.queryData(state);
          }
          return;
        }
        message.error('删除失败')
      }
    })
  }
  handleFinish = text => {
    let { _id,task} = text;
    console.log(text)
    confirm({
      title: '提示',
      content: `你已经完成了${task}任务吗？`,
      okType: 'warning',
      onOk: async () => {
        let res = await api.task.completeTask(_id);
        if (parseInt(res.code) === 0) {
          message.success(res.msg);
          this.cancel();
          // 重新获取指定状态下的数据
          let state = parseInt(localStorage.getItem('state') || 0);
          if (state !== 2) {
            // 不是已完成才拉取
            this.queryData(state);
          }
          return;
        }
        message.error('删除失败')
      }
    })

  }
  queryData = async state => {
    this.setState({
      loading: true
    })
    let res = await api.task.getTaskList(state)
    console.log(res.list)
    if (parseInt(res.code) === 0) {
      this.setState({
        data: res.list,
        loading:false
      })
      return;
    }
    // 失败
    message.error('数据获取失败,稍后再试')
    this.setState({
      loading:false
    })
  }
  componentWillMount () {
    console.log(localStorage.getItem('state'));
    let state = parseInt(localStorage.getItem('state')) || 0;
    if (state !== 0) {
      this.changeTagState(state);
    }
    this.queryData(state)
  }
  // 新增任务
  submit = async () => {
    let { task, time } = this.state;
    if (task.trim().length === 0) {
      message.warn('任务不能为空')
    }
    if (!time) {
      message.warn('完成时间不能为空')
    }

    time = time.toDate();
    time = time.toLocaleString();
    let result = await api.task.addTask(task, time);
    let { code,msg} = result;
    if (parseInt(code) === 0) {
      message.success(msg)
      this.cancel();
      // 重新获取指定状态下的数据
      let state = parseInt(localStorage.getItem('state') || 0);
      if (state !== 2) {
        // 不是已完成才拉取
        this.queryData(state);
      }
      
      return;
    }
    message.error('新增失败!')
  }
  cancel = () => {
    this.setState({
      visible: false,
      time: NOWNEXT,
      task:''
      
    })
  }
  // 切换页卡
  changeType = ev => {
    let target = ev.target;
    let state = target.getAttribute('state');
    if (target.tagName !== 'SPAN') return;
    state = parseInt(state);
    this.changeTagState(state)
    // 获取数据
    this.queryData(state)
    // 把本地选中往本地存储一份
    localStorage.setItem('state',state)
  }
  changeTagState = (state) => {
    let tagList = this.state.tagList;
    tagList = tagList.map(item => {
      item.selected = item.state === state ? true : false;
      return item;
    })
    this.setState({
      tagList
    })
  }


}
