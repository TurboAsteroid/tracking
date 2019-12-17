<template>
  <div class="NDR">
    <div v-for="message in messages" :key="message.sap" style="padding: 4px">
      <msg :title='message.title' :message='message.body' :deviceid='message.deviceid' :sap='message.sap' v-if='!message.isAllowedRoad'/>
    </div>
  </div>
</template>
<script>
// TODO: на сколько мне известно - модуль не используется и не требуется
import S from '../../../store'
import msg from '../../helpers/msg'
import { mapGetters } from 'vuex'
export default {
  name: 'NotificationIfDenyRoad',
  components: {
    msg
  },
  data () {
    return {
      messages: []
    }
  },
  watch: {
    notificationIfDenyRoad: function (vals, oldVals) {
      this.messages = []
      vals.forEach(val => {
        if (!val.isAllowedRoad) {
          S.getters.devicesOnMap.forEach(it => {
            if (val.deviceid === it.options.deviceid) {
              this.messages.push({
                title: 'Внимание!',
                body:
                  it.options.driver +
                  ' ' +
                  it.options.autoNumber +
                  ' съехал с дороги',
                deviceid: it.options.deviceid,
                sap: it.options.sap
              })
            }
          })
        }
      }, this)
    }
  },
  computed: {
    ...mapGetters(['notificationIfDenyRoad'])
  }
}
</script>
<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.NDR {
  position: absolute;
  z-index: 10000;
  bottom: 10px;
  left: 10px;
  max-height: 400px;
}
</style>
