<template>
  <div class="box-card">
    <help :text="`
      Кликом левой кнопкой мыши по доступным областям на карте выберите разрешенные места стоянки. Повторный клик отменяет выбор.
    `"/>
    <span v-for="(i, index) in connectMapPolygons" :key="index" v-if="i.options.active === 1">{{i.options.name}}; </span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import help from '../../helpers/help'
export default {
  name: 'editAllowedStops',
  components: { help },
  data () {
    return {}
  },
  mounted () {
    this.$socket.emitPreloader('connect_editAllowstops')
  },
  methods: {
  },
  watch: {},
  computed: {
    ...mapGetters({
      connectMapPolygons: 'connectStore/connectMapPolygons'
    })
  }
}
</script>

<style scoped></style>
