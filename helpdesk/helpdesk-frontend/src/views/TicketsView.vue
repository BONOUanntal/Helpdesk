<script setup lang="ts">
import { ref, onMounted } from 'vue'

const tickets = ref([])

onMounted(async () => {
  const token = localStorage.getItem('token')

  console.log(token)

  const response = await fetch('http://localhost:3000/tickets', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  tickets.value = data
})
</script>

<template>
  <div>
    <h1>Liste des tickets</h1>

    <div
      v-for="ticket in tickets"
      :key="ticket.id"
    >
      {{ ticket.subject }}
    </div>
  </div>
</template>