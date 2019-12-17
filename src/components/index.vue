<template>
  <el-row :gutter="20">
    <el-col :span="12" :offset="6">
      <el-card style="margin-top: 30px">
        <el-container>
          <el-header>
            <h1>Tracking</h1>
          </el-header>
          <el-main>
            <div><router-link to="/monitor" tag="el-button" style="width: 100%; margin-bottom: 20px;">Отслеживание трекеров</router-link></div>
            <div><router-link to="/cu" tag="el-button" style="width: 100%; margin-bottom: 20px;">Выдача/изъятие трекеров</router-link></div>
            <div><router-link to="/AllowedStops" tag="el-button" style="width: 100%; margin-bottom: 20px;">Редактор разрешенных мест стоянки</router-link></div>
            <div><router-link to="/Elem" tag="el-button" style="width: 100%; margin-bottom: 20px;">Редактор территории завода</router-link></div>
            <div><router-link to="/pathfinder/pathfindereditor" tag="el-button" style="width: 100%; margin-bottom: 20px;">Редактор дорог</router-link></div>
            <div><router-link to="/pathfinder" tag="el-button" style="width: 100%; margin-bottom: 20px;">Поиск маршрута</router-link></div>
          </el-main>
        </el-container>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'index',
  mounted () {
    this.$resetState()
  }
}
</script>
