<template>
  <el-button type="primary" @click="handTestBtn">handTestBtn</el-button>
  <el-button type="primary" @click="handleInvokeTest">handleInvokeTest</el-button>
</template>

<script>
import { sayHello, invokeTest } from '@/render/common/ipcUtil';
export default {
  name: 'App',
  components: {
    
  },
  methods: {
    async handTestBtn() { 
      const ret = await sayHello();
      console.log(ret);
    },
    async handleInvokeTest() { 
      invokeTest();
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
