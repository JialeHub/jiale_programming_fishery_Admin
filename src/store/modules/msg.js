const type = {
  SET_MSG: 'SET_MSG'
};

const state = {
  msg: {
    show: false,
    color: '',
    timeout: 0,
    text: ''
  }
};

const getters = {
  msg: state => state.msg
};

const mutations = {
  [type.SET_MSG](state, msg) {
    if (msg) state.msg = msg;
    else state.msg = {}
  }
};

const actions = {
  setMsg: ({commit}, msg) => {
    commit(type.SET_MSG, msg)
  }
};

export default {
  state,
  getters,
  mutations,
  actions
}
