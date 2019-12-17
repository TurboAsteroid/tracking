<template>
  <div class="NDS">
    <div v-for="message in messages" :key="message.sap" style="padding: 4px">
      <msg :title='message.title' :message='message.body' :deviceid='message.deviceid' :sap='message.sap' v-if='!message.isAllowedRoad'/>
    </div>
  </div>
</template>
<script>
import S from '@/store'
import msg from '../../helpers/msg'
import { mapGetters } from 'vuex'
export default {
  name: 'NotificationIfDenyStop',
  components: {
    msg
  },
  data () {
    return {
      messages: []
    }
  },
  watch: {
    notificationIfDenyStop: function (vals, oldVals) {
      this.messages = []
      vals.forEach(val => {
        if (!val.isAllowedStop) {
          S.getters.devicesOnMap.forEach(it => {
            if (val.deviceid === it.options.deviceid) {
              this.messages.push({
                title: 'Внимание!',
                body:
                  it.options.driver +
                  ' ' +
                  it.options.autoNumber +
                  ' находится в неполположенном месте',
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
    ...mapGetters(['notificationIfDenyStop'])
  }
}
</script>
<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.NDS {
  position: absolute;
  z-index: 10000;
  bottom: 10px;
  right: 10px;
  max-height: 400px;
}
</style>
