<script setup>
import { ref } from 'vue'
import { useInventory } from '../composables/useInventory'

const { createProjectDB } = useInventory()
const emit = defineEmits(['close'])

const form = ref({ name: '', target: 5 })

const createProject = async () => {
  if (!form.value.name) return
  await createProjectDB(form.value.name, form.value.target)
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 shadow-2xl">
      <h3 class="text-lg font-bold text-white mb-4">Buat Proyek Perakitan Baru</h3>
      <form @submit.prevent="createProject" class="space-y-4">
        <div>
          <label class="text-xs text-slate-400 block mb-1">Nama Proyek / Board</label>
          <input v-model="form.name" type="text" placeholder="misal: Dashboard RPM V2" required class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">Target Jumlah PCB</label>
          <input v-model.number="form.target" type="number" min="1" required class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm text-slate-400 hover:text-white transition">Batal</button>
          <button type="submit" class="bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">Buat Proyek</button>
        </div>
      </form>
    </div>
  </div>
</template>