<template>
  <div class="SapDocsTag" v-if="adding.sapDocN.length === 0">
    <el-card class="box-card">
      <div slot="header">
        <el-row type="flex" justify='center'><h3 style="margin: 0px !important;">Все пропуски</h3></el-row>
      </div>
      <el-input placeholder="введите сюда фамилию или номер пропуска" v-model="filter" :autofocus='true'>
          <template slot="prepend"><i class="el-icon-search"/> Поиск:</template>
        </el-input>
      <div v-for="doc in sd">
        <el-button style="width: 100%; margin-top: 4px; margin-bottom: 4px;" @click="select(doc.DOKNR)">{{parseInt(doc.DOKNR)}} {{doc.NAME_DRVR}} {{doc.AUTO_NOMER}}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import S from '@/store'
import { mapGetters } from 'vuex'
export default {
  name: 'SapDocs',
  data () {
    return {
      filter: '',
      sd: []
    }
  },
  mounted () {
    S.dispatch('loadSapDocs')
  },
  methods: {
    select (sapDocN) {
      S.commit('addingSapDocN', parseInt(sapDocN))
    }
  },
  watch: {
    filter: function () {
      this.sd = []
      S.getters.sapDocs.forEach(function (i) {
        if (
          i.DOKNR.indexOf(this.filter) > -1 ||
          i.NAME_DRVR.toLowerCase().indexOf(this.filter.toLowerCase()) > -1 ||
          i.AUTO_NOMER.toLowerCase().indexOf(this.filter.toLowerCase()) > -1
        ) {
          this.sd.push(i)
        }
      }, this)
    },
    sapDocs: function () {
      this.sd = []
      S.getters.sapDocs.forEach(function (i) {
        if (
          i.DOKNR.indexOf(this.filter) > -1 ||
          i.NAME_DRVR.toLowerCase().indexOf(this.filter.toLowerCase()) > -1 ||
          i.AUTO_NOMER.toLowerCase().indexOf(this.filter.toLowerCase()) > -1
        ) {
          this.sd.push(i)
        }
      }, this)
    }
  },
  computed: {
    ...mapGetters(['sapDocs', 'adding'])
  }
}
</script>

<style scoped>
.SapDocsTag {
  position: absolute;
  z-index: 1000;
  top: 10px;
  left: 10px;
}
.box-card {
  width: 560px;
}
</style>
