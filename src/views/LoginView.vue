<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { verifyCredentials, setSession } from '../utils/auth'
import { store } from '../composables/useContentStore'

const router = useRouter()
const route = useRoute()

const account = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  if (!account.value || !password.value) {
    error.value = '请输入账号和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const ok = await verifyCredentials(account.value, password.value)
    if (!ok) {
      error.value = '账号或密码错误，请重试'
      loading.value = false
      return
    }
    setSession()
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'
    router.replace(redirect)
  } catch {
    error.value = '当前环境不支持安全校验，请使用 HTTPS 或本地开发环境访问'
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <span class="brand-dot"></span>
        <span class="login-brand-name">{{ store.profile.name }}</span>
      </div>
      <h1 class="login-title">管理后台登录</h1>
      <p class="login-desc">仅限站点所有者登录后执行编辑与发布操作</p>

      <form class="login-form" @submit.prevent="onSubmit">
        <label class="login-field">
          <span class="login-label">账号</span>
          <input
            v-model.trim="account"
            type="text"
            autocomplete="username"
            placeholder="请输入登录账号"
            class="login-input"
          />
        </label>
        <label class="login-field">
          <span class="login-label">密码</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="请输入登录密码"
            class="login-input"
          />
        </label>

        <p v-if="error" class="login-error">{{ error }}</p>

        <button type="submit" class="btn btn-primary btn-lg login-submit" :disabled="loading">
          {{ loading ? '校验中…' : '登 录' }}
        </button>
      </form>

      <router-link to="/" class="login-back">返回主页</router-link>
    </div>
  </div>
</template>