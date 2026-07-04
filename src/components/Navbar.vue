<script setup>
import { useInventory } from '../composables/useInventory'

const { 
  projects, activeProjectId, currentProject, 
  printOrderReceipt, copyWhatsAppOrder, resetCurrentStockDB 
} = useInventory()

const emit = defineEmits(['openNewProject'])
</script>

<template>
  <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
    <div>
      <div class="flex items-center gap-3">
        <span class="text-3xl">⚡</span>
        <h1 class="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
          Smart BOM & Inventory
        </h1>
      </div>
      <p class="text-slate-400 text-sm mt-1">Sistem manajemen stok komponen SMD/THT & kalkulator order PCB</p>
    </div>

    <!-- Actions -->
    <div class="flex flex-wrap items-center gap-2 md:gap-3" v-if="currentProject">
      <!-- Dropdown Proyek -->
      <div class="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1">
        <select 
          v-model="activeProjectId" 
          class="bg-transparent text-sm font-semibold px-3 py-1.5 focus:outline-none text-sky-400 cursor-pointer"
        >
          <option v-for="p in projects" :key="p.id" :value="p.id" class="bg-slate-900 text-white">
            📁 {{ p.name }} ({{ p.target_pcb }} PCB)
          </option>
        </select>
        <button @click="$emit('openNewProject')" class="bg-slate-800 hover:bg-slate-700 text-xs px-2.5 py-1.5 rounded text-slate-300 transition" title="Buat Proyek Baru">+ Proyek</button>
      </div>

      <div class="h-6 w-px bg-slate-800 hidden md:block"></div>

      <!-- Tombol Baru 1: Cetak Struk / Simpan PDF -->
      <button @click="printOrderReceipt" class="bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 text-sm font-medium px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm" title="Cetak struk belanja atau simpan sebagai PDF">
        <span>🖨️</span> Cetak Struk Order
      </button>

      <!-- Tombol Baru 2: Copy Format WhatsApp -->
      <button @click="copyWhatsAppOrder" class="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-sm font-medium px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm" title="Salin daftar belanja format teks WhatsApp">
        <span>📋</span> Copy List WA
      </button>
      
      <!-- Reset Stok -->
      <button @click="resetCurrentStockDB" class="bg-slate-800 hover:bg-slate-700 text-amber-400 text-sm px-3 py-2 rounded-lg transition border border-slate-700" title="Reset semua stok di proyek ini ke 0">
        ⚠️ Reset
      </button>
    </div>
  </header>
</template>