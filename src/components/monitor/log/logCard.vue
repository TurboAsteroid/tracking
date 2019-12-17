<template>
  <div>
    <el-button @click="$router.go(-1)">Назад</el-button>
    <el-button v-if="logCardData !== null" type="primary" @click="showMarker" style="float: right;">Показать точку нарушения</el-button>
    <el-button v-if="logCardData !== null" type="primary" @click="showHideNameMethod" style="float: right;">{{showHideName}}</el-button>
    <el-table v-if="showHideName ==='Скрыть таблицу'" v-loading="logCardData === null" :data='logCardData' max-height="500px">
      <el-table-column prop='key' label='Наименование'/>
      <el-table-column prop='val' label='Значение'/>
    </el-table>
  </div>
</template>

<script>
import S from '@/store'
import M from 'moment'
import L from 'leaflet'
import { mapGetters } from 'vuex'
export default {
  name: 'logCard',
  props: ['inputData'],
  data () {
    return {
      logCardData: null,
      id: parseInt((this.$route.params.logCardNumber.split('_'))[0]),
      prefix: (this.$route.params.logCardNumber.split('_'))[1],
      counter: -1,
      latlng: null,
      showHideName: 'Скрыть таблицу'
    }
  },
  beforeRouteLeave (to, from, next) {
    this.cleaner(true)
    next()
  },
  methods: {
    showHideNameMethod () {
      if (this.showHideName === 'Скрыть таблицу') {
        this.showHideName = 'Показать таблицу'
      } else {
        this.showHideName = 'Скрыть таблицу'
      }
    },
    cleaner (full) {
      if (S.getters.logStore.marker !== null) {
        S.getters.map.setView([56.96105930170542, 60.57539042144521], 15)
        S.getters.map.removeLayer(S.getters.logStore.marker)
        S.commit('logStore/marker', null)
      } else {
        S.getters.map.setView([56.96105930170542, 60.57539042144521], 15)
      }
      if (full) {
        S.commit('logStore/logCardData', null)
      }
    },
    async showMarker () {
      await this.cleaner(false)
      S.getters.map.setView(this.latlng, 15)
      S.commit('logStore/marker', L.marker(this.latlng).addTo(S.getters.map).setIcon(S.getters.iconChecked))
      if (this.showHideName === 'Скрыть таблицу') {
        this.showHideNameMethod()
      }
    },
    loader () {
      try {
        let data = S.getters.logStore.logCardData
        this.latlng = [data.latitude, data.longitude]
        if (data.entry !== null) {
          // надо именно так как внизу иначе варнинг в момент
          data.entry = M(data.entry, 'YYYY-MM-DDTHH:mm:ss.000Z').format('YYYY.MM.DD HH:mm:ss')
        }
        if (data.departure !== null) {
          // надо именно так как внизу иначе варнинг в момент
          data.departure = M(data.departure, 'YYYY-MM-DDTHH:mm:ss.000Z').format('YYYY.MM.DD HH:mm:ss')
        }
        data = {
          'Скорость': data.speed,
          'Номер трекера': data.device,
          'Дата и время нарушения': data.dt,
          'Номер пропуска в SAP ERP': data.sapDocs,
          'ФИО водителя': data.NAME_DRVR,
          'Время привязки трекера к пропуску': M(data.attach, 'YYYY-MM-DDTHH:mm:ss.000Z').format('YYYY.MM.DD HH:mm:ss'),
          'Время въезда': data.entry,
          'Время выезда': data.departure,
          'Документ удост. личность': data.DOCTYPE,
          'Марка автомобиля': data.AUTO_MARKA,
          'Гос. номер автомобиля': data.AUTO_NOMER,
          'Начало действия': M(data.VALID_DATE_FROM, 'YYYY-MM-DDTHH:mm:ss.000Z').format('YYYY.MM.DD HH:mm:ss'),
          'Окончание действия': M(data.VALID_DATE_TO, 'YYYY-MM-DDTHH:mm:ss.000Z').format('YYYY.MM.DD HH:mm:ss'),
          'Направляется к сотруднику': data.INIT_PNM + '; ' + data.INIT_SNM,
          'Направляется в подразделение': data.INIT_ONM,
          'Пропуск введен сотрудником': data.AUTHOR_PNM + '; ' + data.AUTHOR_SNM,
          'Подразделение': data.AUTHOR_ONM,
          'Дата и время создания': M(data.CREATED_ON_CREATED_TM, 'YYYY-MM-DDTHH:mm:ss.000Z').format('YYYY.MM.DD HH:mm:ss')
        }
        this.logCardData = []
        for (var key in data) {
          if (data[key] !== null) {
            this.logCardData.push({key: key, val: data[key]})
          }
        }
      } catch (e) {
        console.log(`loader: ${e}`)
      }
    }
  },
  mounted () {
    if (S.getters.logStore.logCardData === null) {
      this.$socket.emit('log_get_cardData_id', { id: this.id, prefix: this.prefix })
    } else {
      this.loader()
    }
    S.commit('logStore/logActiveTab', this.prefix)
  },
  watch: {
    logCardDataStore: function (val, newVal) {
      this.loader()
    }
  },
  computed: {
    ...mapGetters({
      logCardDataStore: 'logStore/logCardData'
    })
  }
}
</script>

<style scoped>

</style>
