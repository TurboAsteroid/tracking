<template>
    <div v-if="report3Table">
      <span @click="help = !help" style="font-size: 14px;">
        Подсказки
        <i class="el-icon-arrow-down" v-if="!help"/>
        <i class="el-icon-arrow-up" v-if="help"/>
      </span>
      <help v-if="help" :text="`Клик по № пропуска в строке таблицы перенаправит вас к построению отчета по пропуску`"/>
      <help v-if="help" :text="`Клик по ФИО водителя в строке таблицы перенаправит вас к построению отчета по водителю`"/>
      <el-table
        :data="report3Table"
        style="width: 100%" @cell-click="select"
        :cell-class-name="tableCellClassName">
        <el-table-column
          prop="sap"
          label="№ пропуска"
          width="125px"/>
        <el-table-column
          prop="entryD"
          label="Въезд"
          width="135px"/>
        <el-table-column
          prop="departureD"
          label="Выезд"
          width="135px"/>
        <el-table-column
          prop="NAME_DRVR"
          label="ФИО водителя"/>
        <el-table-column
          prop="AUTO_MARKA"
          label="Марка авто"/>
        <el-table-column
          prop="AUTO_NOMER"
          label="Номер авто"
          width="105px"/>
      </el-table>
    </div>
</template>

<script>
import help from '../../helpers/help'
import { mapGetters } from 'vuex'
import router from '@/router'
import M from 'moment'
export default {
  name: 'report3Table',
  components: { help },
  data () {
    return {
      help: false
    }
  },
  methods: {
    tableCellClassName ({row, column, rowIndex, columnIndex}) {
      if (columnIndex === 0 || columnIndex === 3) {
        return 'report3TableCell'
      }
      return ''
    },
    select (row, column, cell) {
      let entry = null
      let departure = null
      if (row.entry === 'нет въезда') {
        entry = M().format('YYYY-MM-DD HH:mm:ss').replaceAll(':', 'D').replaceAll('.', 'P')
      } else {
        entry = M(row.entry).format('YYYY-MM-DD HH:mm:ss').replaceAll(':', 'D').replaceAll('.', 'P')
      }
      if (row.departureD === 'нет выезда') {
        departure = M().format('YYYY-MM-DD HH:mm:ss').replaceAll(':', 'D').replaceAll('.', 'P')
      } else {
        departure = M(row.departure).format('YYYY-MM-DD HH:mm:ss').replaceAll(':', 'D').replaceAll('.', 'P')
      }
      if (column.property === 'sap') {
        router.push('/report1/' + cell.childNodes[0].innerText + '/' + entry + '/' + departure)
      }
      if (column.property === 'NAME_DRVR') {
        router.push('/report2/' + cell.childNodes[0].innerText + '/' + entry + '/' + departure)
      }
    }
  },
  computed: {
    ...mapGetters(['report3Table'])
  }
}
</script>

<style>
  .el-table .report3TableCell :hover {
    background: #66b1ff66;
    border-radius: 3px;
    cursor: pointer;
  }
</style>
