<template>
    <div class="MapTag">
        <div id="divmap" v-bind:style="{height: windowHeight + 'px'}"></div>
        <span v-if="$route.fullPath === '/monitor'">
        <Unattach v-if="!settingsIsOpened"/>
        <CurrentInfo/>
        <NotificationDenyStop/>
        <NotificationDenyRoad/>
        <NotificationHighSpeed/>
        <el-menu :default-active="activeIndex" class="topper" mode="horizontal">
          <el-submenu index="1">
            <template slot="title">Настройки</template>
            <el-menu-item @click="settingsIsOpened = !settingsIsOpened"
                          index="1-1">Порог превышения скорости</el-menu-item>
            <!-- TODO: необходимо тестирование и допиливание, т.к. просто не работает как надо -->
            <!--<el-menu-item index="1-2" @click="goToLogs">Основной лог</el-menu-item>-->
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">Отчеты</template>
            <el-menu-item @click="goToReport('report1')" index="2-1">Отчет по пропуску</el-menu-item>
            <el-menu-item @click="goToReport('report2')" index="2-2">Отчет по водителю</el-menu-item>
            <el-menu-item @click="goToReport('report3')" index="2-3">Таблица пропусков за дату</el-menu-item>
            <el-menu-item @click="goToReport('reportByName')" index="2-4">Отчет по водителю TRACCAR API</el-menu-item>
          </el-submenu>
        </el-menu>
        <el-card class="settings" v-if="settingsIsOpened">
          <div slot="header">
            <el-row :gutter="4" style="margin: 0px !important;">
              <el-col :span="22" style="margin: 0px !important;"><h3 style="margin: 0px !important;">Порог превышения скрости</h3></el-col>
            </el-row>
          </div>
          <el-input-number :max="200" :min="-1" class="item" v-model="settingsSpeedLimit"></el-input-number> км/ч
          <el-button @click="settingsIsOpened = !settingsIsOpened" style="float: right;">Закрыть</el-button>
        </el-card>
      </span>
        <div class="msg">
            <div :key="message.deviceid" style="margin-bottom: 10px; margin-top: 10px"
                 v-for="message in connectTrackersStateDevicesBatteryLevel">
                <msgHelper :icon="'el-icon-error'"
                           :message='"Заряд трекера составляет " + message.batteryLevel + "%"'
                           :title='"Внимание! Трекер №" + message.deviceid + " разряжен"'
                           v-if='message.batteryLevel <= 40'/>
            </div>
        </div>
        <router-view/>
    </div>
</template>

<script>
import S from '../../store'
import R from '../../router'
import {mapGetters} from 'vuex'
import Unattach from './Unattach'
import CurrentInfo from './CurrentInfo'
import NotificationDenyStop from './notifications/NotificationDenyStop'
import NotificationDenyRoad from './notifications/NotificationDenyRoad'
import NotificationHighSpeed from './notifications/NotificationHighSpeed'
import msgHelper from '../connect/msgHelper'
// import axios from 'axios'
export default {
  name: 'monitor',
  components: {
    Unattach,
    CurrentInfo,
    NotificationDenyStop,
    NotificationDenyRoad,
    NotificationHighSpeed,
    msgHelper
  },
  data () {
    return {
      windowHeight: window.innerHeight,
      activeIndex: '1',
      settingsIsOpened: false,
      settingsSpeedLimit: null
    }
  },
  mounted () {
    this.$nextTick(() => {
      window.addEventListener('resize', () => {
        this.windowHeight = window.innerHeight
      })
    })
    // const encodeForm = (data) => {
    //   return Object.keys(data)
    //     .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    //     .join('&')
    // }
    // axios({
    //   url: 'http://10.1.255.208:9999/api/session',
    //   method: 'post',
    //   data: encodeForm({
    //     email: '',
    //     password: ''
    //   }),
    //   withCredentials: true,
    //   headers: {'Accept': 'application/json'}
    // }).then(function (resp) {
    //   console.log(resp)
    //   let ws = new WebSocket(`ws://10.1.255.208:9999/api/socket`)
    //   ws.onopen = function () {
    //     console.log('Соединение с Traccar API установлено.')
    //   }
    //   ws.onclose = function (event) {
    //     if (event.wasClean) {
    //       console.log('Соединение с Traccar API закрыто чисто')
    //     } else {
    //       console.log('Обрыв соединения с Traccar API') // например, "убит" процесс сервера
    //     }
    //     console.log('Код: ' + event.code + ' причина: ' + event.reason)
    //   }
    //
    //   ws.onmessage = function (event) {
    //     console.log('Получены данные данные с Traccar API просто выводятся в лог')
    //     console.log(JSON.parse(event.data))
    //   }
    //
    //   ws.onerror = function (error) {
    //     console.log('Ошибка ' + error.message)
    //   }
    // }).catch(function (e) {
    //   console.log(e)
    // })
    // берем настройки
    this.settingsSpeedLimit = localStorage.getItem('settingsSpeedLimit')
    if (this.settingsSpeedLimit === null) {
      localStorage.setItem('settingsSpeedLimit', this.settings.speedLimit)
    } else {
      S.commit('settingsSpeedLimit', this.settingsSpeedLimit)
    }
    S.dispatch('initMap')
    S.commit('setPair', {id: -1, sap: -1})
    // this.$socket.emitPreloader('devices')
    // this.$socket.emitPreloader('move')
    // this.$socket.emitPreloader('sapDocs')
  },
  methods: {
    goToReport (reportName) {
      S.commit('currentInfo', [])
      S.dispatch('clearCurrentTrack')
      S.commit('report2Driver', [])
      R.push(reportName)
    },
    goToLogs () {
      R.push({name: 'log'})
    }
  },
  watch: {
    windowHeight (newHeight, oldHeight) {
      this.txt = `it changed to ${newHeight} from ${oldHeight}`
    },
    pairid: function (val, oldval) {
      if (R.history.current.fullPath === '/monitor') {
        if (this.pair.id > 0) {
          for (let i = 0; i < S.getters.devicesOnMap.length; i++) {
            if (S.getters.devicesOnMap[i].options.deviceid === this.pair.id) {
              S.getters.devicesOnMap[i].setIcon(S.getters.iconChecked)
              S.getters.map.setView(S.getters.devicesOnMap[i].getLatLng())
              S.commit('setPair', {
                id: S.getters.devicesOnMap[i].options.deviceid,
                sap: S.getters.devicesOnMap[i].options.sap
              })
              S.commit('currentInfo', [])
              S.dispatch('clearCurrentTrack')
              S.dispatch('loadCurrentInfo', this.pair.sap)
            }
            // S.commit('currentInfo', [])
            // S.dispatch('clearCurrentTrack')
            // S.dispatch('loadCurrentInfo', this.pair.sap)
          }
        } else {
          S.commit('currentInfo', [])
          S.dispatch('clearCurrentTrack')
        }
      }
    },
    settingsSpeedLimit: function (newVal) {
      this.settingsSpeedLimit = newVal
      S.commit('settingsSpeedLimit', newVal)
      localStorage.setItem('settingsSpeedLimit', newVal)
    }
  },
  computed: {
    ...mapGetters({
      connectTrackersStateDevicesBatteryLevel: 'connectStore/connectTrackersStateDevicesBatteryLevel',
      settings: 'settings',
      devices: 'devices',
      adding: 'adding',
      pair: 'pair',
      pairid: 'pairid'
    })
  }
}
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
    #divmap {
        width: 100%;
    }

    .MapTag {
        position: absolute;
        z-index: 0;
        width: 100%;
        height: 100%;
    }

    .settings {
        position: absolute;
        z-index: 1300;
        top: 10px;
        left: 10px;
        width: 560px;
    }

    .topper {
        position: absolute;
        z-index: 1320;
        top: 10px;
        left: 334px;
      width: 238px;
      height: 53px;
    }

    .msg {
        position: absolute;
        z-index: 1000;
        bottom: 0px;
        left: 10px;
        max-height: 400px;
    }

    .msgbtn {
        position: absolute;
        z-index: 10000;
        bottom: 10px;
        right: 10px;
        max-height: 400px;
    }
</style>
