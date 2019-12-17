const NotificationIfDenyStop = {
  state: {
    NotificationIfDenyStop: null
  },
  mutations: {
    NotificationIfDenyStop (state, val) {
      state.NotificationIfDenyStop = val
    }
  },
  getters: {
    notificationIfDenyStop: state => {
      return state.NotificationIfDenyStop
    }
  }
}

export default NotificationIfDenyStop
