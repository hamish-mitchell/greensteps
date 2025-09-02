<script setup lang="ts">
definePageMeta({
  layout: 'app-shell',
  tagline: 'Need a hand? Reach out to us.'
})

import Card from '~/components/ui/card/Card.vue'
import Button from '~/components/ui/button/Button.vue'
import Textarea from '~/components/ui/textarea/Textarea.vue'
import Input from '~/components/ui/input/Input.vue'

const config = useRuntimeConfig()
const supportEmail = (config.public as any)?.SUPPORT_EMAIL || 'support@example.com'

const name = ref('')
const email = ref('')
const message = ref('')

function mailtoHref() {
  const subj = encodeURIComponent('GreenSteps Support Request')
  const body = encodeURIComponent(`Name: ${name.value}\nEmail: ${email.value}\n\n${message.value}`)
  return `mailto:${supportEmail}?subject=${subj}&body=${body}`
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-semibold tracking-tight">Support</h1>
      <p class="text-sm text-muted-foreground">We usually respond within 1–2 business days.</p>
    </div>

    <Card class="p-6 space-y-4">
      <h2 class="text-sm font-medium">Contact</h2>
      <p class="text-sm text-muted-foreground">
        Email us directly at
        <a :href="`mailto:${supportEmail}`" class="underline underline-offset-2">{{ supportEmail }}</a>
        or use the quick form below which opens your email client pre-filled.
      </p>
      <form @submit.prevent>
        <div class="grid gap-3">
          <div class="grid gap-1">
            <label class="text-xs font-medium">Name</label>
            <Input v-model="name" placeholder="Your name" />
          </div>
            <div class="grid gap-1">
            <label class="text-xs font-medium">Email</label>
            <Input v-model="email" type="email" placeholder="you@example.com" />
          </div>
          <div class="grid gap-1">
            <label class="text-xs font-medium">Message</label>
            <Textarea v-model="message" rows="5" placeholder="How can we help?" />
          </div>
          <div class="flex gap-2">
            <Button as-child>
              <a :href="mailtoHref()">Open Email App</a>
            </Button>
            <Button type="button" variant="outline" @click="name=''; email=''; message=''">Clear</Button>
          </div>
        </div>
      </form>
    </Card>

    <Card class="p-6 space-y-4">
      <h2 class="text-sm font-medium">Quick FAQ</h2>
      <ul class="text-sm list-disc pl-5 space-y-2 text-muted-foreground">
        <li><span class="font-medium text-foreground">Points not updating?</span> Try refreshing; if still stuck include your activity details in the message.</li>
        <li><span class="font-medium text-foreground">Password reset?</span> Use the Forgot Password link on sign in; contact us if the email doesn’t arrive.</li>
        <li><span class="font-medium text-foreground">Found a bug?</span> Describe the steps and your browser/device.</li>
      </ul>
    </Card>
  </div>
</template>

<style scoped>
a { color: hsl(var(--primary)); }
</style>