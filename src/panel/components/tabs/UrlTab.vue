<script setup lang="ts">
import CodecPanel from '../CodecPanel.vue'
import { urlEncode, urlDecode } from '../../utils/codec'
</script>

<template>
  <CodecPanel
    :encode="urlEncode"
    :decode="urlDecode"
    encode-label="编码"
    decode-label="解码"
    input-placeholder="输入文本或 URL 编码字符串..."
    output-placeholder="URL 编码结果..."
  />
</template>
