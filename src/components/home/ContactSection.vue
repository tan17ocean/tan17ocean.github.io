<script setup>
import { computed } from 'vue'
import { profile } from '../../data/profile'

const socials = computed(() => {
  const list = []
  const c = profile.contact
  if (c.github) list.push({ label: 'GitHub', href: c.github })
  if (c.juejin) list.push({ label: '掘金', href: c.juejin })
  if (c.twitter) list.push({ label: 'Twitter', href: c.twitter })
  return list
})
</script>

<template>
  <section id="contact" class="section">
    <h2 class="section-title">联系我 <span class="section-en">Contact</span></h2>
    <div class="contact-card gradient-card" v-reveal>
      <p class="contact-slogan">有想法想交流？欢迎来信。</p>
      <a :href="`mailto:${profile.contact.email}`" class="contact-email">{{ profile.contact.email }}</a>
      <div v-if="socials.length" class="contact-socials">
        <a
          v-for="s in socials"
          :key="s.label"
          :href="s.href"
          target="_blank"
          rel="noopener"
          class="btn btn-ghost btn-sm"
        >
          {{ s.label }}
        </a>
      </div>
    </div>
  </section>
</template>