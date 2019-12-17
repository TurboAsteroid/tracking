<template>
  <div class="ReportDocsTag">
    <el-card class="box-card">
      <div slot="header">
        <el-row type="flex" justify='start'><h4 style="margin: 0px !important;">Шаг 1/2. Поиск пропуска для отчета</h4></el-row>
      </div>
      <el-row :gutter="4">
        <el-col :span="18"><el-input placeholder="введите сюда фамилию или номер пропуска" v-model="filter" @keyup.enter.native="search" :autofocus='true' /></el-col>
        <el-col :span="6">
        <el-button @click="search" style="float: right;"><i class="el-icon-search"/> Поиск</el-button>
        </el-col>
      </el-row>
      <div v-for="doc in reportDocs" :key="doc.DOKNR">
        <el-button @click="select(doc)" style="width: 100%; margin-top: 4px; margin-bottom: 4px;">{{parseInt(doc.DOKNR)}} {{doc.NAME_DRVR}} {{doc.AUTO_NOMER}}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import S from '@/store'
import R from '@/router'
import M from 'moment'
import { mapGetters } from 'vuex'
export default {
  name: 'reportDocs',
  data () {
    return {
      filter: ''
    }
  },
  mounted () {
    S.commit('reportDocs', [])
  },
  methods: {
    search () {
      if (this.filter !== '') {
        S.dispatch('searchReportDocs', this.filter)
      }
    },
    select (doc) {
      if (doc.entry === 'нет въезда') {
        this.$alert('Пропуска не было на территории', 'Внимание', {
          confirmButtonText: 'OK'
        })
      } else {
        doc.entry = doc.entry.replaceAll(':', 'D').replaceAll('.', 'P')
        if (doc.departure === 'нет выезда') {
          doc.departure = M().format('YYYY-MM-DD HH:mm:ss')
        }
        doc.departure = doc.departure.replaceAll(':', 'D').replaceAll('.', 'P')
        R.push('/report1/' + doc.DOKNR + '/' + doc.entry + '/' + doc.departure)
        S.commit('reportDocs', [])
        S.commit('report', {
          sap: doc.DOKNR,
          date1: doc.entry,
          date2: doc.departure,
          track: [],
          stops: [],
          info: [],
          criticalspeed: -1
        })
        this.filter = ''
      }
    }
  },
  computed: {
    ...mapGetters(['reportDocs'])
  }
}
</script>

<style scoped>
.ReportDocsTag {
  position: absolute;
  z-index: 1000;
  top: 10px;
  left: 10px;
}
.box-card {
  width: 560px;
  max-height: 573px;
  overflow: auto;
  position: fixed
}
</style>
