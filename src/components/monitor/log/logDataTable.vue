<template>
  <div :style="{ 'max-height': windowHeight/1.3 + 'px' }" style="overflow: auto; min-height: 200px;">
    <el-table
      v-if="$route.name === 'log'"
      v-loading="data === null"
      :data="data"
      :default-sort = "{prop: 'dt', order: 'descending'}"
      :fit="false"
      @cell-click="select">
      <el-table-column
        prop="NAME_DRVR"
        label="ФИО"
        width="180">
      </el-table-column>
      <el-table-column
        prop="AUTO_MARKA"
        label="Марка авто"
        width="180">
      </el-table-column>
      <el-table-column
        prop="AUTO_NOMER"
        label="Номер авто"
        width="180">
      </el-table-column>
      <el-table-column
        prop="dt"
        label="Дата и время"
        sortable
        width="180">
      </el-table-column>
      <el-table-column
        prop="device"
        label="№ трекера"
        width="100">
      </el-table-column>
      <el-table-column
        prop="sapDocs"
        label="№ документа в SAP"
        width="180">
      </el-table-column>
      <el-table-column
        prop="speed"
        label="Скорость"
        width="180">
      </el-table-column>
    </el-table>
    <router-view />
  </div>
</template>

<script>
import R from '@/router'
import S from '@/store'
export default {
  name: 'logDataTable',
  props: ['data', 'prefix'],
  data () {
    return {
      windowHeight: 0
    }
  },
  mounted () {
    this.windowHeight = window.innerHeight
    let that = this
    this.$nextTick(function () {
      window.addEventListener('resize', function (e) {
        that.windowHeight = window.innerHeight
      })
    })
  },
  watch: {
    windowHeight (newHeight, oldHeight) {
      this.windowHeight = newHeight
    }
  },
  methods: {
    select (row, column, cell) {
      let logCardData = []
      let val = this.data
      let len = val.length
      for (let i = 0; i < len; i++) {
        if (val[i].id === row.id) {
          logCardData = val[i]
          break
        }
      }
      if (logCardData === null) {
        logCardData = []
      }
      S.commit('logStore/logCardData', logCardData)
      R.push({ name: 'logCard', params: { logCardNumber: row.id + this.prefix } })
    }
  }
}
</script>
