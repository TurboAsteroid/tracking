<template>
    <div class="report3SelectDate">
      <el-row type="flex" align="middle">
      <el-col :span='6'>Дата въезда:</el-col>
        <el-col :span='18'>
          <el-date-picker
            v-model="value1"
            type="date"
            placeholder="Кликните для выбора даты"
            :picker-options="pickerOptions1"
            style="width: 100%;"
          />
        </el-col>
      </el-row>

    </div>
</template>

<script>
export default {
  name: 'report3SelectDate',
  data () {
    return {
      pickerOptions1: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
          text: 'Сегодня',
          onClick (picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: 'Вчера',
          onClick (picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }]
      },
      value1: ''
    }
  },
  watch: {
    value1: function (val, oldVal) {
      this.$socket.emitPreloader('report3_getTable', val)
    }
  },
  methods: {

  }
}
</script>

<style scoped>
  .report3SelectDate {
  }
</style>
