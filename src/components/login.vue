<template>
  <div class="login">
    <el-card class="box-card">
      <el-container>
        <el-header>
          <h1>Страница логина</h1>
        </el-header>
        <el-main>
          Страница логина
        </el-main>
      </el-container>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'login',
  mounted () {
    this.$resetState()
  }
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
  .login {
    position: absolute;
    z-index: 0;
    width: 100%;
    height: 100%;
    background: #f0f0f0;
  }
</style>
