<template>
  <a>
    <slot></slot>
  </a>
</template>

<style scoped>
a {
  text-decoration: underline;
  cursor: pointer;
  transition: ease-in 0.4s;
}

a:hover {
  filter: brightness(130%);
}
</style>
