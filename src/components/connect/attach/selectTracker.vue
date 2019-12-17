<template>
  <div>
      <el-container>
        <el-header>
          <h4>
            <span>Шаг 3: ВЫБОР ТРЕКЕРА</span>
            <el-button type="text" style="float: right; padding: 3px 0" @click="back"><i class="el-icon-arrow-left"></i> Назад</el-button>
          </h4>
        </el-header>
      </el-container>
      <el-container>
        <el-header>
          {{parseInt(connectSelectedItem.step1.doknr)}} {{connectSelectedItem.step2.driver}}
          <el-row>
            <el-col :span="16">
              <el-input clearable :autofocus='true' placeholder="введите сюда номер трекера" v-model="filter"
                        @keyup.native="search" @keyup.enter.native="attach"/></el-col>
            <el-col :span="8"><el-button @click="attach" type="primary" style="float: right;" :disabled='!exist' >Выдать трекер</el-button></el-col>
          </el-row>
        </el-header>
        <el-main v-if="filter !== ''">
          <h2 style="text-align: center;">Трекер <span v-if="!exist">не</span> найден</h2>
        </el-main>
      </el-container>
  </div>
</template>

<script>
import S from '@/store'
import { mapGetters } from 'vuex'
export default {
  name: 'selectTracker',
  data () {
    return {
      filter: '',
      exist: false
    }
  },
  mounted () {
    this.$socket.emitPreloader('connect_trackers')
  },
  methods: {
    attach () {
      // перед прикреплением проверяем что с батарейкой, а дальше ответ вызовет нужный экшен
      S.commit('connectStore/connectSelectedItem', {
        currentStep: this.connectSelectedItem.currentStep,
        step1: {
          doknr: this.connectSelectedItem.step1.doknr
        },
        step2: {
          polygonsId: this.connectSelectedItem.step2.polygonsId,
          names: this.connectSelectedItem.step2.names,
          driver: this.connectSelectedItem.step2.driver
        },
        step3: {
          trackerId: this.filter,
          connect_batteryLevel: -1
        }
      })
      this.$socket.emitPreloader('connect_batteryLevel', this.filter)
    },
    back () {
      S.commit('connectStore/connectSelectedItem', {
        currentStep: 2,
        step1: {
          doknr: this.connectSelectedItem.step1.doknr
        },
        step2: {
          polygonsId: this.connectSelectedItem.step2.polygonsId,
          names: this.connectSelectedItem.step2.names,
          driver: this.connectSelectedItem.step2.driver
        },
        step3: {
          trackerId: -1,
          connect_batteryLevel: -1
        }
      })
    },
    search () {
      this.exist = false
      for (var i = 0; i < this.connectTrackers.length; i++) {
        if (this.connectTrackers[i].id.toString() === this.filter) {
          this.exist = true
          break
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      connectSelectedItem: 'connectStore/connectSelectedItem',
      connectTrackers: 'connectStore/connectTrackers'
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
