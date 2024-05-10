<template>
  <div>
    <iframe
      v-if="verifyLink"
      :src="verifyLink"
      width="400"
      height="400"
    />
  </div>
</template>
<script>
export default {
    props: {
        verifyLink: {
            type: String,
            default() {
                return '';
            },
        },
    },

};
</script>
<style>
    iframe{
        border:1px solid #f1f1f1;
    }
</style>
