<script setup>
import { ref, computed } from 'vue'
import { useInventory } from '../composables/useInventory'

const { currentProject, calculateOrder, updateItemDB, deleteItemDB } = useInventory()
const emit = defineEmits(['openAddItem', 'openEditItem'])

const searchQuery = ref('')
const filterStatus = ref('ALL')

const filteredItems = computed(() => {
  if (!currentProject.value || !currentProject.value.bom_items) return []
  return currentProject.value.bom_items.filter(item => {
    const matchQuery = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                       item.category.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                       item.package.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const orderQty = calculateOrder(item)
    if (filterStatus.value === 'KURANG' && orderQty === 0) return false
    if (filterStatus.value === 'AMAN' && orderQty > 0) return false

    return matchQuery
  })
})

const getStatusBadge = (item) => {
  const orderQty = calculateOrder(item)
  if (orderQty === 0) return { label: 'Aman', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' }
  if ((item.stock || 0) === 0) return { label: 'Kosong', class: 'bg-rose-500/10 text-rose-400 border-rose-500/30' }
  return { label: 'Kurang', class: 'bg-amber-500/10 text-amber-400 border-amber-500/30' }
}

const deleteItem = (id) => {
  deleteItemDB(id)
}

const formatRupiah = (num) => new Intl.NumberFormat('id-ID').format(num || 0)
</script>

<template>
  <div>
    <!-- Controls -->
    <div class="flex flex-col md:flex-row gap-3 justify-between items-center mb-4">
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div class="relative flex-1 md:w-64">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cari nama, nilai, package..." 
            class="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-200 placeholder:text-slate-500"
          />
          <span class="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
        </div>
        <select v-model="filterStatus" class="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500">
          <option value="ALL">Semua Status</option>
          <option value="KURANG">⚠️ Harus Order (Kurang/Kosong)</option>
          <option value="AMAN">✅ Stok Aman</option>
        </select>
      </div>

      <button @click="$emit('openAddItem')" class="w-full md:w-auto bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm px-4 py-2 rounded-lg transition shadow-lg shadow-sky-600/20 flex items-center justify-center gap-1.5">
        <span>+</span> Tambah Komponen Baru
      </button>
    </div>

    <!-- Table -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl" v-if="currentProject">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-semibold">
              <th class="p-4 w-12 text-center">No</th>
              <th class="p-4">Kategori & Nama Komponen</th>
              <th class="p-4">Package / Ukuran</th>
              <th class="p-4 text-center">Qty / PCB</th>
              <th class="p-4 text-center">Total Butuh</th>
              <th class="p-4 text-center w-32">Stok Sisa</th>
              <th class="p-4 text-center">Status</th>
              <th class="p-4 text-center">Wajib Order</th>
              <th class="p-4 text-right">Harga Asli / Pcs</th>
              <th class="p-4 text-right">Subtotal Order</th>
              <th class="p-4 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 text-sm">
            <tr v-if="filteredItems.length === 0">
              <td colspan="11" class="p-8 text-center text-slate-500">Komponen tidak ditemukan. Coba reset filter.</td>
            </tr>
            <tr v-for="(item, index) in filteredItems" :key="item.id" class="hover:bg-slate-800/40 transition group">
              <td class="p-4 text-center text-slate-500 font-mono text-xs">{{ index + 1 }}</td>
              
              <td class="p-4">
                <div class="font-bold text-slate-100 flex items-center gap-2">
                  {{ item.name }}
                  <span v-if="item.auto_buffer" class="px-1.5 py-0.2 text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded font-normal" title="Otomatis tambah 30% cadangan order">+30% Buffer</span>
                </div>
                <div class="text-xs text-slate-400 mt-0.5">{{ item.category }}</div>
              </td>

              <td class="p-4"><span class="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700/50">{{ item.package }}</span></td>
              <td class="p-4 text-center font-semibold text-slate-300">{{ item.qty_per_pcb }}</td>
              <td class="p-4 text-center font-bold text-sky-400">{{ item.qty_per_pcb * currentProject.target_pcb }}</td>

              <!-- Input Stok -->
              <td class="p-4">
                <div class="flex items-center justify-center">
                  <input 
                    type="number" min="0" 
                    v-model.number="item.stock" 
                    @change="updateItemDB(item)"
                    class="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-center font-bold text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                  />
                </div>
              </td>

              <td class="p-4 text-center">
                <span :class="getStatusBadge(item).class" class="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border inline-block">
                  {{ getStatusBadge(item).label }}
                </span>
              </td>

              <td class="p-4 text-center font-extrabold text-base" :class="calculateOrder(item) > 0 ? 'text-rose-400' : 'text-slate-500'">
                {{ calculateOrder(item) }} <span class="text-xs font-normal text-slate-400">pcs</span>
              </td>

              <!-- Harga Satuan -->
              <td class="p-4 text-right">
                <div class="font-mono font-semibold text-amber-400 cursor-pointer hover:underline" @click="$emit('openEditItem', item)" title="Klik untuk edit harga/spesifikasi">
                  Rp {{ formatRupiah(item.price) }}
                </div>
              </td>

              <td class="p-4 text-right font-mono font-bold text-slate-200">
                Rp {{ formatRupiah(calculateOrder(item) * (item.price || 0)) }}
              </td>

              <!-- Tombol Edit & Hapus -->
              <td class="p-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button @click="$emit('openEditItem', item)" class="text-slate-400 hover:text-amber-400 transition p-1" title="Edit spesifikasi & harga">✏️</button>
                  <button @click="deleteItem(item.id)" class="text-slate-500 hover:text-rose-400 transition p-1" title="Hapus komponen">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>