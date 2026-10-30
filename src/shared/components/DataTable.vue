<template>
  <div class="table-responsive">
    <table class="table table-hover mb-0">
      <thead>
        <tr>
          <slot name="head" />
        </tr>
      </thead>
      <tbody>
        <slot />
      </tbody>
    </table>
  </div>
</template>
