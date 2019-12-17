<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  watch: {
    '$route' (to, from) {
      console.log(to)
      console.log(from)
    }
  }
}
</script>

<style>
::-webkit-scrollbar {
    width: 3px;
}
::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 3px rgba(0,0,0,1);
    border-radius: 10px;
}
::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 3px rgba(0,0,0,1);
}
::-webkit-input-placeholder { /* Chrome/Opera/Safari */
  color: rgba(34, 34, 34, 0.7) !important;
}
::-moz-placeholder { /* Firefox 19+ */
  color: rgba(34, 34, 34, 0.7) !important;
}
:-ms-input-placeholder { /* IE 10+ */
  color: rgba(34, 34, 34, 0.7) !important;
}
:-moz-placeholder { /* Firefox 18- */
  color: rgba(34, 34, 34, 0.7) !important;
}
</style>
