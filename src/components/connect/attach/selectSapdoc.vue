<template>
  <div>
    <el-container>
      <el-header>
        <h4>Шаг 1: ВЫБОР ПРОПУСКА</h4>
      </el-header>
    </el-container>
      <el-container>
        <el-header>
          <el-row>
            <el-col :span="19">
              <el-input clearable :autofocus='true' placeholder="введите сюда номер пропуска или фамилию"
                        v-model="filter" @keyup.native="search"/></el-col>
            <el-col :span="5"><el-button @click="search" style="float: right;">Поиск</el-button></el-col>
          </el-row>
        </el-header>
        <el-main class="sc" v-if="filtred.length > 0">
          <div v-for="(i, index) in filtred" :key="index">
            <el-button style="width: 100%" @click="select(i.DOKNR, i.NAME_DRVR)">{{parseInt(i.DOKNR)}} {{i.NAME_DRVR}}</el-button>
          </div>
        </el-main>
        <el-main v-if="filtred.length <= 0">
          <h2 style="text-align: center;">Ничего не найдено</h2>
        </el-main>
      </el-container>
  </div>
</template>

<script>
import S from '@/store'
import { mapGetters } from 'vuex'
export default {
  name: 'selectSapdoc',
  props: ['isActiveTab'],
  data () {
    return {
      filter: '',
      filtred: []
    }
  },
  mounted () {
  },
  methods: {
    search () {
      this.filtred = []
      for (var i = 0; i < this.connectSapdocs.length; i++) {
        if (
          parseInt(this.connectSapdocs[i].DOKNR).toString().indexOf(this.filter) > -1 ||
          this.connectSapdocs[i].NAME_DRVR.toLowerCase().indexOf(this.filter) > -1
        ) {
          this.filtred.push(this.connectSapdocs[i])
        }
      }
    },
    select (itemDOKNR, itemNAMEDRVR) {
      S.commit('connectStore/connectSelectedItem', {
        currentStep: 2,
        step1: {
          doknr: itemDOKNR
        },
        step2: {
          polygonsId: [],
          names: [],
          driver: itemNAMEDRVR
        },
        step3: {
          trackerId: -1,
          connect_batteryLevel: -1
        }
      })
    }
  },
  watch: {
    connectSapdocs: function (val, oldVal) {
      this.search()
    },
    isActiveTab: function (val, oldVal) {
      if (val !== oldVal) {
        this.filter = ''
        this.search()
      }
    }
  },
  computed: {
    ...mapGetters({
      connectSapdocs: 'connectStore/connectSapdocs'
    })
  }
}
</script>

<style scoped>
.box-card {
  width: 560px;
}
.sc {
  max-height: 573px;
  overflow-y: scroll;
}
</style>
