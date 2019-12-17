<template>
  <div>
      <el-container>
        <el-header>
        <h4>
          <span>Шаг 2: ВЫБОР МЕСТ СТОЯНКИ</span>
          <el-button type="text" style="float: right; padding: 3px 0" @click="back"><i class="el-icon-arrow-left"></i> Назад</el-button>
        </h4>
        </el-header>
      </el-container>
      <el-header>
        {{parseInt(connectSelectedItem.step1.doknr)}} {{connectSelectedItem.step2.driver}}
        <p class="help">
          Кликом левой кнопкой мыши по доступным областям на карте выберите разрешенные места стоянки. Повторный клик отменяет выбор.
        </p>
        <span v-for="(i, index) in connectSelectedItem.step2.names" :key="index">{{i}}; </span>
        <p style="float: right; padding-bottom: 20px;" >
          <el-button type="primary" @click="next" :disabled='connectSelectedItem.step2.polygonsId.length < 1' >
            Продолжить <i class="el-icon-arrow-right"></i>
          </el-button>
        </p>
      </el-header>
  </div>
</template>

<script>
import S from '@/store'
import { mapGetters } from 'vuex'
export default {
  name: 'selectAllowedStops',
  props: ['driver'],
  data () {
    return {}
  },
  mounted () {
    this.$socket.emitPreloader('connect_allowstops')
  },
  methods: {
    next () {
      S.commit('connectStore/connectSelectedItem', {
        currentStep: 3,
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
    back () {
      this.$socket.emitPreloader('connect_sapdocs')
      S.dispatch('connectStore/clearConnectMap')
      S.commit('connectStore/connectSelectedItem', {
        currentStep: 1,
        step1: {
          doknr: this.connectSelectedItem.step1.doknr
        },
        step2: {
          polygonsId: [],
          names: [],
          driver: null
        },
        step3: {
          trackerId: -1,
          connect_batteryLevel: -1
        }
      })
    }
  },
  watch: {},
  computed: {
    ...mapGetters({
      connectSelectedItem: 'connectStore/connectSelectedItem'
    })
  }
}
</script>

<style scoped>
.box-card {
  width: 560px;
}
.help {
  border: 1px solid #aaaaaa;
  border-radius: 3px;
  padding: 20px;
}
</style>
