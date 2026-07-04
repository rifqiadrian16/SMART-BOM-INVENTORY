<script setup>
import { computed } from 'vue'
import { useInventory } from '../composables/useInventory'

const { currentProject, calculateOrder } = useInventory()

const stats = computed(() => {
  if (!currentProject.value || !currentProject.value.bom_items) return { aman: 0, kurang: 0, total: 0, totalBudget: 0 }
  let aman = 0, kurang = 0, totalBudget = 0
  
  // Ganti .items menjadi .bom_items
  currentProject.value.bom_items.forEach(item => {
    const orderQty = calculateOrder(item)
    if (orderQty > 0) {
      kurang++
      totalBudget += orderQty * (item.price || 0)
    } else {
      aman++
    }
  })
  return { aman, kurang, total: currentProject.value.bom_items.length, totalBudget }
})

const formatRupiah = (num) => new Intl.NumberFormat('id-ID').format(num || 0)
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" v-if="currentProject && currentProject.bom_items">
    <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
      <div class="text-xs text-slate-400 font-medium">Target Perakitan</div>
      <div class="flex items-baseline gap-2 mt-1">
        <input 
          type="number" min="1" 
          v-model.number="currentProject.target_pcb" 
          class="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xl font-bold w-20 text-sky-400 focus:outline-none focus:border-sky-500"
        />
        <span class="text-sm font-semibold text-slate-400">Board PCB</span>
      </div>
      <div class="text-[11px] text-slate-500 mt-1">Ubah angka untuk auto-kalkulasi</div>
    </div>

    <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
      <div class="text-xs text-slate-400 font-medium">Status Komponen</div>
      <div class="flex items-center gap-3 mt-1">
        <span class="text-emerald-400 text-lg font-bold">{{ stats.aman }} Aman</span>
        <span class="text-slate-600">|</span>
        <span class="text-rose-400 text-lg font-bold">{{ stats.kurang }} Kurang</span>
      </div>
      <div class="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden flex">
        <div class="bg-emerald-500 transition-all duration-300" :style="`width: ${(stats.aman / (stats.total || 1)) * 100}%`"></div>
        <div class="bg-rose-500 transition-all duration-300" :style="`width: ${(stats.kurang / (stats.total || 1)) * 100}%`"></div>
      </div>
    </div>

    <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
      <div class="text-xs text-slate-400 font-medium">Total Jenis Item (BOM)</div>
      <div class="text-2xl font-extrabold text-white mt-1">{{ currentProject.bom_items.length }} <span class="text-xs font-normal text-slate-400">part unik</span></div>
      <div class="text-[11px] text-slate-500 mt-1">Auto +30% Buffer untuk SMD/LED</div>
    </div>

    <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
      <div class="text-xs text-slate-400 font-medium">Estimasi Biaya Order</div>
      <div class="text-xl md:text-2xl font-extrabold text-amber-400 mt-1">Rp {{ formatRupiah(stats.totalBudget) }}</div>
      <div class="text-[11px] text-slate-500 mt-1">Untuk barang yang statusnya kurang</div>
    </div>
  </div>
</template>