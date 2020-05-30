<template>
  <div class="customer-component">
    <div class="left"></div>
    <div class="center"></div>
    <div class="right"></div>
  </div>
</template>
<style lang="stylus">
  .customer-component
    height: calc(100vh - 60px);
    display: flex;
    background-color: #333;
    color: #fff;
    & > div
      flex: 0 0 200px;
      width: 200px;
      text-align: center
    .left
      background-color: #58a;
    .center
      flex: 1;
      background-color: #fb3;
    .right
      background-color: #58a;
</style>
