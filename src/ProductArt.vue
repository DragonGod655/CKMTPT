<script setup>
defineProps({ shape: String, paint: String })
</script>

<template>
  <svg viewBox="0 0 300 260" aria-hidden="true" class="art">
    <ellipse cx="150" cy="225" rx="90" ry="10" fill="#302717" opacity=".10" />
    <g :fill="paint" stroke="#322c24" stroke-opacity=".27" stroke-width="2" stroke-linejoin="round">
      <path v-if="shape === 'shirt'" d="M111 49 131 39 Q150 52 169 39 L189 49 221 72 245 170 216 179 195 114 195 217 105 217 105 114 84 179 55 170 79 72Z" />
      <path v-else-if="shape === 'pants'" d="M109 39H191L211 219H165L150 104 135 219H89Z" />
      <path v-else-if="shape === 'bag'" d="M92 100H208L220 215H80Z" />
      <path v-else d="M112 51 131 44 Q150 65 169 44 L188 51 235 81 211 118 193 107 198 215H102L107 107 89 118 65 81Z" />
    </g>
    <g fill="none" stroke="#322c24" stroke-opacity=".4" stroke-width="2" stroke-linejoin="round">
      <path v-if="shape === 'shirt'" d="M131 40 150 64 133 82 111 49M169 40 150 64 167 82 189 49M150 64V217M163 96H184V121H163Z" />
      <path v-else-if="shape === 'pants'" d="M109 54H192M150 54V102M112 58Q111 81 100 83M188 58Q189 81 200 83" />
      <path v-else-if="shape === 'bag'" :stroke="paint" stroke-opacity="1" stroke-width="11" d="M118 107V73C118 32 182 32 182 73V107" />
      <path v-else d="M123 47Q149 85 177 47" />
    </g>
    <text v-if="shape === 'bag'" x="150" y="164" text-anchor="middle" fill="#322c24" font-family="Georgia" font-size="17">MỘC</text>
  </svg>
</template>
