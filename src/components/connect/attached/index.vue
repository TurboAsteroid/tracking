<template>
  <div>
    <el-container v-if="!connectEditTracker.editable">
      <el-header>
        <h4>Изъятие или редактирование трекера</h4>
      </el-header>
      <el-main>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-input :autofocus='true' placeholder="введите сюда номер трекера" class="w100" v-model="deviceid" clearable/>
          </el-col>
        </el-row>
        <span v-if="deviceid !== '' && exist">
        <el-row :gutter="40" style="padding-top: 20px">
          <el-col :span="6">{{DOKNR}}</el-col>
          <el-col :span="18">{{NAME_DRVR}}</el-col>
        </el-row>
        <el-row :gutter="20" style="padding-top: 20px">
          <el-col :span="8">
            <el-button type="default" class="w100" @click="cancel">Отмена</el-button>
          </el-col>
          <el-col :span="8">
            <el-button type="danger" class="w100" @click="unattach">Изъять</el-button>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" class="w100" @click="connectEditTracker.editable = true">Редактировать</el-button>
          </el-col>
        </el-row>
        </span>
        <h2 style="text-align: center;" v-if="deviceid !== '' && !exist">Трекер не найден</h2>
      </el-main>
    </el-container>
    <selectEdit v-if="connectEditTracker.editable"/>
  </div>
</template>

<script>
import selectEdit from './selectEdit'
import { mapGetters } from 'vuex'
import S from '@/store'
export default {
  name: 'attached',
  props: ['isActiveTab'],
  data () {
    return {
      NAME_DRVR: '',
      DOKNR: '',
      deviceid: '',
      exist: false
    }
  },
  mounted () {
    // this.$socket.emit('connect_activeInfo', this.deviceid)
    // просит данные о местах стоянки и выводит их сразу после загрузки приложения
    // this.$socket.emit('connect_allowstops')
  },
  components: { selectEdit },
  methods: {
    cancel () {
      this.deviceid = ''
      this.NAME_DRVR = ''
      this.DOKNR = ''
      this.exist = false
      S.dispatch('connectStore/clearConnectMap')
    },
    unattach () {
      this.$socket.emit('connect_unattach', this.deviceid)
      S.dispatch('connectStore/clearConnectMap')
      this.deviceid = ''
    }
  },
  watch: {
    deviceid: function (val, oldVal) {
      this.NAME_DRVR = ''
      this.DOKNR = ''
      this.exist = false
      S.dispatch('connectStore/clearConnectMap')
      this.connectActiveInfo.forEach(info => {
        if (val.toString() === info.deviceid.toString()) {
          this.exist = true
          this.NAME_DRVR = info.NAME_DRVR
          this.DOKNR = info.DOKNR
          S.dispatch('connectStore/connectDrawMarker', info)
        }
      }, this)
    },
    isActiveTab: function (val, oldVal) {
      if (val !== oldVal) {
        this.deviceid = ''
      }
    }
  },
  computed: {
    ...mapGetters({
      connectEditTracker: 'connectStore/connectEditTracker',
      connectActiveInfo: 'connectStore/connectActiveInfo'
    })
  }
}
</script>

<style scoped>
.box-card {
  width: 560px;
}
.w100 {
  width: 100%;
}
</style>
