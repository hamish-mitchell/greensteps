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
  <div class="container mx-auto p-4">
    <Card class="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Contact Support</CardTitle>
        <CardDescription>Send us a message and we'll get back to you.</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="sendEmail">
          <div>
            <Label for="name">Name</Label>
            <Input id="name" v-model="form.name" required />
          </div>
          <div>
            <Label for="email">Email</Label>
            <Input id="email" v-model="form.email" type="email" required />
          </div>
          <div>
            <Label for="subject">Subject</Label>
            <Input id="subject" v-model="form.subject" required />
          </div>
          <div>
            <Label for="message">Message</Label>
            <Textarea id="message" v-model="form.message" required />
          </div>
          <Button type="submit">Send Email</Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const sendEmail = () => {
  const subject = encodeURIComponent(form.subject)
  const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
  window.open(`mailto:support@greensteps.app?subject=${subject}&body=${body}`)
}
</script>

<style>
</style>