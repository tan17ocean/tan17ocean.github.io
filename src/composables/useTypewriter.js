import { ref, onBeforeUnmount } from 'vue'

// 打字机轮播效果：依次打字-停顿-删除，循环播放 phrases
export function useTypewriter(phrases, { typeMs = 90, deleteMs = 45, holdMs = 1600 } = {}) {
  const text = ref('')
  let phraseIndex = 0
  let timer = null

  function typeStep(full) {
    const target = full
    const step = () => {
      if (text.value.length < target.length) {
        text.value = target.slice(0, text.value.length + 1)
        timer = setTimeout(step, typeMs)
      } else {
        timer = setTimeout(deleteStep, holdMs)
      }
    }
    step()
  }

  function deleteStep() {
    const step = () => {
      if (text.value.length > 0) {
        text.value = text.value.slice(0, -1)
        timer = setTimeout(step, deleteMs)
      } else {
        phraseIndex = (phraseIndex + 1) % phrases.length
        typeStep(phrases[phraseIndex])
      }
    }
    step()
  }

  function start() {
    if (!phrases || phrases.length === 0) return
    typeStep(phrases[0])
  }

  function stop() {
    if (timer) clearTimeout(timer)
    timer = null
  }

  onBeforeUnmount(stop)

  return { text, start, stop }
}