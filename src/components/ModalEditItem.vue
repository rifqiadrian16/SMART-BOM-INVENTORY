<script setup>
import { ref } from 'vue'
import { useInventory } from '../composables/useInventory'

const { addItemDB } = useInventory()
const emit = defineEmits(['close'])

// Sesuaikan penamaan variabel dengan kolom tabel Supabase (snake_case)
const form = ref({ 
  category: '', 
  name: '', 
  package: 'SMD 1206', 
  qty_per_pcb: 1, 
  stock: 0, 
  auto_buffer: true, 
  price: 100 
})

const saveItem = async () => {
  if (!form.value.name || !form.value.category) return
  // Panggil fungsi simpan langsung ke database Supabase
  await addItemDB(form.value)
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
      <h3 class="text-lg font-bold text-white mb-4">Tambah Komponen Baru</h3>
      <form @submit.prevent="saveItem" class="space-y-4">
        <div>
          <label class="text-xs text-slate-400 block mb-1">Kategori</label>
          <input v-model="form.category" type="text" placeholder="misal: Resistor, IC, Konektor" required class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">Nama Komponen / Nilai</label>
          <input v-model="form.name" type="text" placeholder="misal: Resistor 10k Ohm / ESP32" required class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">Package / Footprint</label>
            <input v-model="form.package" type="text" placeholder="misal: SMD 1206" required class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Qty per PCB</label>
            <input v-model.number="form.qty_per_pcb" type="number" min="1" required class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">Stok Saat Ini</label>
            <input v-model.number="form.stock" type="number" min="0" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Est. Harga Satuan (Rp)</label>
            <input v-model.number="form.price" type="number" min="0" step="50" class="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500" />
          </div>
        </div>
        <div class="flex items-center gap-2 pt-2">
          <input v-model="form.auto_buffer" type="checkbox" id="buf" class="rounded bg-slate-950 border-slate-700 text-sky-500 w-4 h-4 cursor-pointer" />
          <label for="buf" class="text-xs text-slate-300 cursor-pointer">Aktifkan Auto-Buffer +30%</label>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm text-slate-400 hover:text-white transition">Batal</button>
          <button type="submit" class="bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition">Simpan Komponen</button>
        </div>
      </form>
    </div>
  </div>
</template>