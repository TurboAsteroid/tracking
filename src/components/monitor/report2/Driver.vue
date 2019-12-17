<template>
  <div class="DriverTag">
    <el-card class="box-card" v-if="$route.params.NAME_DRVR === undefined">
      <div slot="header">
        <el-row type="flex" justify='start'><h4 style="margin: 0px !important;">Шаг 1/2. Поиск водителя</h4></el-row>
      </div>
      <el-row :gutter="4">
        <el-col :span="18"><el-input placeholder="введите сюда фамилию водителя" v-model="filter" @keyup.enter.native="search" :autofocus='true' /></el-col>
        <el-col :span="6">
        <el-button @click="search" style="float: right;"><i class="el-icon-search"/> Поиск</el-button>
        </el-col>
      </el-row>
      <div v-for="driver in report2Driver" v-if="report2Driver.length > 0" :key="driver.NAME_DRVR">
        <el-button @click="select(driver)" style="width: 100%; margin-top: 4px; margin-bottom: 4px;">{{driver.NAME_DRVR}}</el-button>
      </div>
      <el-row type="flex" justify='center'><h4 style="margin-bottom: 0px !important;">{{report2Driver.msg}}</h4></el-row>
    </el-card>
  </div>
</template>

<script>
import S from '@/store'
import { mapGetters } from 'vuex'

export default {
  name: 'Drivers',
  data () {
    return {
      filter: ''
    }
  },
  methods: {
    search () {
      S.dispatch('report2searchDriverLike', this.filter)
    },
    select (driver) {
      S.dispatch('report2DriverTime', driver)
    }
  },
  computed: {
    ...mapGetters(['report2Driver'])
  }
}
</script>

<style scoped>
.DriverTag {
  position: absolute;
  z-index: 1000;
  top: 10px;
  left: 10px;
}
.box-card {
  width: 560px;
}
</style>
