<script setup lang="ts">
defineProps<{
  tickets: any[]
  supports: any[]
}>()

const emit = defineEmits([
  'open-ticket',
  'assign-ticket',
  'update-status'
])
</script>

<template>
  <div class="bg-white rounded-xl shadow overflow-hidden">

    <table class="w-full text-sm">

      <thead class="bg-gray-100">
        <tr>
          <th class="p-3 text-left">ID</th>
          <th class="p-3 text-left">App</th>
          <th class="p-3 text-left">Sujet</th>
          <th class="p-3 text-left">Priorité</th>
          <th class="p-3 text-left">Statut</th>
          <th class="p-3 text-left">Assigné</th>
          <th class="p-3 text-left">Action</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="t in tickets"
          :key="t.id"
          class="border-t hover:bg-gray-50"
        >

          <td class="p-3 text-blue-600 font-bold">
            #{{ t.id }}
          </td>

          <td class="p-3">
            {{ t.application?.name }}
          </td>

          <td class="p-3">
            {{ t.subject }}
          </td>

          <td class="p-3">
            {{ t.priority }}
          </td>

          <td class="p-3">
            {{ t.status }}
          </td>

          <td class="p-3">
            <select
              @change="$emit('assign-ticket', t.id, $event.target.value)"
            >
              <option value="">—</option>
              <option
                v-for="s in supports"
                :key="s.id"
                :value="s.id"
              >
                {{ s.name }}
              </option>
            </select>
          </td>

          <td class="p-3">
            <button
              @click="$emit('open-ticket', t)"
              class="text-blue-600"
            >
              Voir
            </button>
          </td>

        </tr>
      </tbody>

    </table>

  </div>
</template>