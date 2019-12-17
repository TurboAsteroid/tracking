<template>
  <div>
    <selectSapdoc class="selectSapdoc" v-if="connectSelectedItem.currentStep === 1" :isActiveTab="isActiveTab"/>
    <selectAllowedStops class="selectAllowedStops" v-if="connectSelectedItem.currentStep === 2"/>
    <selectTracker class="selectTracker"  v-if="connectSelectedItem.currentStep === 3"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import selectSapdoc from './selectSapdoc'
import selectAllowedStops from './selectAllowedStops'
import selectTracker from './selectTracker'
export default {
  name: 'attach',
  props: ['isActiveTab'],
  components: { selectSapdoc, selectAllowedStops, selectTracker },
  computed: {
    ...mapGetters({
      connectSelectedItem: 'connectStore/connectSelectedItem'
    })
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
</style>
