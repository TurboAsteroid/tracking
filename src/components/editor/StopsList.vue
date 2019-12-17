<template>
  <el-card class="StopsListTag">
    <div slot="header">
      <span>Список мест стоянки</span>
      <el-button type="text" style="float: right; padding: 1px 0" @click="startNewStop" v-if="!allowedStopsAllowNew && notEditing">Новое место стоянки</el-button>
      <el-button type="text" style="float: right; padding: 1px 0" @click="endNewStop" v-if="allowedStopsAllowNew && notEditing">Закончить добавление</el-button>
      </div>
      <el-button type="primary" style="width: 100%" @click="save">Сохранить</el-button>
    <div class="StopsListSize">
    <div v-for="arp in allowedStopsPolygons" :key="arp.options.id">
      <el-button type="text" v-bind:style="{ color: arp.options.color }" @click="editIt(arp.options.id)">
      <i class="el-icon-edit"></i> Редактировать {{arp.options.name}}</el-button>
    </div>
    </div>
  </el-card>
</template>

<script>
import S from '@/store'
import { mapGetters } from 'vuex'
export default {
  name: 'StopsList',
  data () {
    return {
      notEditing: true
    }
  },
  methods: {
    editIt (id) {
      this.notEditing = false
      S.dispatch('StopsEnableEdit', id)
    },
    save () {
      this.notEditing = true
      S.commit('allowedStopsAllowNew', false)
      S.dispatch('StopsDisableEdit')
      S.dispatch('AllowedStopsSave')
    },
    startNewStop () {
      this.$prompt('Введите имя нового места стоянки', 'Создание нового места стоянки', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel'
      }).then(value => {
        this.$alert('Кликайте левой кнопкой мыши по карте для того чтобы выбрать головные точки нового места стоянки', 'Подсказка', {
          confirmButtonText: 'OK',
          callback: action => {
            S.commit('allowedStopsNewName', value.value)
            S.commit('allowedStopsAllowNew', true)
          }
        })
      }).catch(() => { })
    },
    endNewStop () {
      S.commit('allowedStopsAllowNew', false)
      S.dispatch('StopsDisableEdit')
      S.dispatch('AllowedStopsSave')
    }
  },
  computed: {
    ...mapGetters(['allowedStopsPolygons', 'allowedStopsAllowNew'])
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.StopsListTag {
  position: absolute;
  z-index: 1000;
  top: 10px;
  left: 10px;
  min-width: 350px;
}
.StopsListSize {
  max-height: 500px;
  padding-left: 50px;
}
</style>
