const NotificationIfDenyRoad = {
  state: {
    NotificationIfDenyRoad: null
  },
  mutations: {
    NotificationIfDenyRoad (state, val) {
      state.NotificationIfDenyRoad = val
    }
  },
  getters: {
    notificationIfDenyRoad: state => {
      return state.NotificationIfDenyRoad
    }
  }
}

export default NotificationIfDenyRoad
