<template>
  <div>
    <el-container>
      <el-header>
        <h4>Редактирование трекера</h4>
        <el-row :gutter="20">
          <el-col :span="6">{{connectEditTracker.info.DOKNR}}</el-col>
          <el-col :span="18">{{connectEditTracker.info.NAME_DRVR}}</el-col>
        </el-row>
      </el-header>
      <el-main>
        <editAllowedStops />
      </el-main>
      <el-footer>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-button type="default" class="w100" @click="cancel">Отмена</el-button>
          </el-col>
          <el-col :span="12">
            <el-button type="primary" class="w100" @click="save">Сохранить</el-button>
          </el-col>
        </el-row>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import editAllowedStops from './editAllowedStops'
import S from '@/store'
export default {
  name: 'selectEdit',
  data () {
    return {
    }
  },
  mounted () {
  },
  components: { editAllowedStops },
  methods: {
    save () {
      // здесь надо отправлять данные на сервер для сохранения состояния трекера
      this.$socket.emitPreloader('connect_editSave', this.connectEditTracker.allowedStops)
      this.cancel() // вызов "назад"
    },
    cancel () {
      S.dispatch('connectStore/clearConnectMap')
      this.connectEditTracker.editable = false
      S.dispatch('connectStore/connectDrawMarker', this.connectEditTracker.info)
    }
  },
  watch: {
  },
  computed: {
    ...mapGetters({
      connectEditTracker: 'connectStore/connectEditTracker'
    })
  }
}
</script>

<style scoped>
.w100 {
  width: 100%;
}
</style>
