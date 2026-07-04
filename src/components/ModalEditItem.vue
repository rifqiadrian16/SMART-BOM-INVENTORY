<script setup>
import { ref } from 'vue'

const props = defineProps({
  item: { type: Object, required: true }
})
const emit = defineEmits(['close'])

// Salin data item yang dipilih ke dalam form sementara
const form = ref({ ...props.item })

const saveChanges = () => {
  // Timpa data asli dengan data baru yang diedit di form
  Object.assign(props.item, form.value)
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <span>✏️</span> Edit Spesifikasi & Harga
        </h3>
        <button @click="$emit('close')" class="text-slate-500 hover:text-white">✕</button>
      </div>

      <form @submit.prevent="saveChanges" class="space-y-4">
        <div>
          <label class="text-xs text-slate-400 block mb-1">Kategori</label>
          <input v-model="form.category" type="text" required class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">Nama Komponen / Nilai</label>
          <input v-model="form.name" type="text" required class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">Package / Footprint</label>
            <input v-model="form.package" type="text" required class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Qty per PCB</label>
            <input v-model.number="form.qtyPerPcb" type="number" min="1" required class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">Stok Saat Ini</label>
            <input v-model.number="form.stock" type="number" min="0" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
          </div>
          <div>
            <label class="text-xs text-amber-400 font-semibold block mb-1">💰 Harga Asli / Pcs (Rp)</label>
            <input v-model.number="form.price" type="number" min="0" step="50" class="w-full bg-slate-950 border border-amber-500/50 rounded px-3 py-2 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400" />
          </div>
        </div>
        <div class="flex items-center gap-2 pt-2">
          <input v-model="form.autoBuffer" type="checkbox" id="editBuf" class="rounded bg-slate-950 border-slate-700 text-sky-500 w-4 h-4 cursor-pointer" />
          <label for="editBuf" class="text-xs text-slate-300 cursor-pointer">Aktifkan Auto-Buffer +30% (Untuk SMD kecil)</label>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm text-slate-400 hover:text-white transition">Batal</button>
          <button type="submit" class="bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition shadow-lg shadow-amber-600/20">Simpan Perubahan</button>
        </div>
      </form>
    </div>
  </div>
</template>