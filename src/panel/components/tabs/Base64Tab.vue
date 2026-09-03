<script setup lang="ts">
import CodecPanel from '../CodecPanel.vue'
import { base64Encode, base64Decode } from '../../utils/codec'
</script>

<template>
  <CodecPanel
    :encode="base64Encode"
    :decode="base64Decode"
    encode-label="编码"
    decode-label="解码"
    input-placeholder="输入文本或 Base64 字符串..."
    output-placeholder="Base64 编码结果..."
  />
</template>
