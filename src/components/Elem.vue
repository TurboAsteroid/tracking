<template>
  <div class="ElemMapTag">
    <div id="divElemMapTag"></div>
    <el-button @click="back" class="goToRoot">Назад</el-button>
    <div class='layout'>
    <el-button @click="save" type="primary">Сохранить</el-button>
    </div>
  </div>
</template>

<script>
import S from '@/store'
import R from '@/router'
export default {
  name: 'Elem',
  mounted () {
    S.dispatch('initElemMap')
    S.dispatch('ElemLoad')
  },
  methods: {
    save () {
      S.dispatch('ElemSave')
    },
    back () {
      R.push('/')
    }
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
#divElemMapTag {
  width: 100%;
  height: 100%;
}
.ElemMapTag {
  position: absolute;
  z-index: 0;
  width: 100%;
  height: 100%;
}
.layout {
  position: absolute;
  z-index: 1000;
  top: 10px;
  left: 10px;
}
.goToRoot {
  position: absolute;
  z-index: 2000;
  top: 10px;
  right: 10px;
}
</style>
