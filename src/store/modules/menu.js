const type = {
  SET_MENU: 'SET_MENU'
};

const state = {
  menu: []
};

const getters = {
  menu: state => state.menu
};

const mutations = {
  [type.SET_MENU](state, menu) {
    if (menu) state.menu = menu;
    else state.menu = []
  }
};

const actions = {
  setMenu: ({commit}, menu) => {
    commit(type.SET_MENU, menu)
  }
};

export default {
  state,
  getters,
  mutations,
  actions
}
