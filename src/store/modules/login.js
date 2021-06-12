const type = {
  SET_REMEMBER_ME: 'SET_REMEMBER_ME',
  SET_EXPIRE_LOGIN: 'SET_EXPIRE_LOGIN',
};

const state = {
  username: '',
  rememberMe: false,
  expireLogin: false,
};

const getters = {
  username: state => state.username,
  rememberMe: state => state.rememberMe,
  expireLogin: state => state.expireLogin
};

const mutations = {
  [type.SET_REMEMBER_ME](state, login) {
    state.rememberMe = login.rememberMe;
    if (state.rememberMe) state.username = login.username;
    else state.username = ''
  },
  [type.SET_EXPIRE_LOGIN](state, expireLogin) {
    state.expireLogin = expireLogin;
  },
};

const actions = {
  setRememberMe: ({commit}, login) => {
    commit(type.SET_REMEMBER_ME, login)
  },
  setExpireLogin: ({commit}, expireLogin) => {
    commit(type.SET_EXPIRE_LOGIN, expireLogin)
  },
};

export default {
  state,
  getters,
  mutations,
  actions
}

