// task模块的接口
import axios from './axios';

const taskAPI = {
  getTaskList (state=0) {
    return axios.get('/getTaskList', {
      params: {
        state
      }
    })
  },
  addTask (task,time) {
    return axios.post('/addTask', {
      task,
      time
    })
  },
  removeTask (id) {
    return axios.get('/removeTask', {
      params: {
        _id:id
      }
    })
  },
  completeTask (id) {
    return axios.get('/completeTask', {
      params: {
        _id:id
      }
    })
  },

};

export default taskAPI;