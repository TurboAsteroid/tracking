<template>
  <div class="DateTime" v-if="$route.params.DOKNR > -1">
    <el-card class="box-card">
      <div slot="header">
        <el-row :gutter="4" style="margin: 0px !important;">
          <el-col :span="22" style="margin: 0px !important;"><h4 style="margin: 0px !important;">Шаг 2/2. Выбор даты и времени для пропуска<br/>{{ $route.params.DOKNR }} {{ $route.params.d1 }}</h4></el-col>
        </el-row>
      </div>
      <el-row v-if="show">
        <el-col :span="6"><el-button @click="cancel" icon='el-icon-arrow-left'>Отмена</el-button></el-col>
        <el-col :span="18">
          <el-date-picker
            v-model="d"
            type="datetimerange"
            range-separator="-"
            start-placeholder="Start date"
            end-placeholder="End date"
            style="width: 100%;" />
        </el-col>
        <el-col style="margin-top: 8px;">
          <el-input type="number" placeholder="пожалуйста, введите сюда значение, км/ч" v-model="criticalspeed">
            <template slot="prepend">Критическая скорость</template>
          </el-input>
        </el-col>
        <el-col :span="24"><el-button style="margin-top: 8px; width: 100%;" @click="doit">Построить отчет</el-button></el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import S from '@/store'
import M from 'moment'
import { mapGetters } from 'vuex'
import R from '@/router'
export default {
  name: 'DateTime',
  data () {
    return {
      d: [],
      show: true,
      criticalspeed: 20
    }
  },
  beforeRouteLeave (to, from, next) {
    S.dispatch('removeReportOnMap')
    S.commit('currentInfo', [])
    next()
  },
  mounted () {
    this.d = [
      M(
        this.$route.params.date1.replaceAll('D', ':').replaceAll('P', '.'),
        'YYYY.MM.DD HH:mm:ss'
      ),
      M(
        this.$route.params.date2.replaceAll('D', ':').replaceAll('P', '.'),
        'YYYY.MM.DD HH:mm:ss'
      )
    ]
  },
  methods: {
    cancel () {
      S.dispatch('removeReportOnMap')
      S.commit('report', {
        sap: -1,
        date1: -1,
        date2: -1,
        track: [],
        stops: [],
        info: [],
        criticalspeed: -1
      })
      R.go(-1)
    },
    doit () {
      S.commit('report', {
        sap: this.$route.params.DOKNR,
        date1: M(this.d[0]).format('YYYY.MM.DD HH:mm:ss'),
        date2: M(this.d[1]).format('YYYY.MM.DD HH:mm:ss'),
        track: [],
        stops: [],
        info: [],
        criticalspeed: this.criticalspeed
      })
      S.dispatch('loadReport1')
    }
  },
  computed: {
    ...mapGetters(['report'])
  }
}
</script>

<style scoped>
.DateTime {
  position: absolute;
  z-index: 2000;
  top: 10px;
  left: 10px;
}
.box-card {
  width: 560px;
}
</style>
