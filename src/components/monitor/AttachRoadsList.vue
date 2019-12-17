<template >
  <el-select v-model="selectedId" placeholder="Выберите маршрут">
    <el-option
      v-for="item in allowedRoadsJustList"
      :key="item.id"
      :label="item.id"
      :value="item.id">
    </el-option>
  </el-select>
</template>

<script>
import S from '@/store'
import { mapGetters } from 'vuex'
export default {
  name: 'AttachRoadsList',
  data () {
    return {
      selectedId: ''
    }
  },
  mounted () {
    S.dispatch('AllowedRoadsLoad', {list: 'list'})
  },
  watch: {
    selectedId: function (val, oldVal) {
      if (val !== oldVal) {
        S.commit('addingRoad', val)
      }
    }
  },
  methods: {},
  computed: {
    ...mapGetters(['allowedRoadsJustList', 'adding'])
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.AttachRoadsList {
  overflow: hidden;
  color: black !important;
}
</style>
