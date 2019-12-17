<template>
  <div class="Page404">
    <el-card class="box-card">
      <h4>Такой страницы не существует</h4>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Page404'
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
.box-card {
  width: 500px;
  height: 500px;
  background-clip: padding-box;
  margin: 180px auto;
  padding: 35px 35px 15px 35px;
}
.Page404 {
  position: absolute;
  z-index: 0;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
}
</style>
