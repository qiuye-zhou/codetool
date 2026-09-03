<script setup lang="ts">
import CodecPanel from '../CodecPanel.vue'
import { unicodeEncode, unicodeDecode } from '../../utils/codec'
</script>

<template>
  <CodecPanel
    :encode="unicodeEncode"
    :decode="unicodeDecode"
    encode-label="编码 \u"
    decode-label="解码 \u"
    input-placeholder="输入文本或 \uXXXX 形式的字符串..."
    output-placeholder="Unicode 转义结果..."
  />
</template>
