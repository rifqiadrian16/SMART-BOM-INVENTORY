<script setup>
import { ref } from 'vue'
import Navbar from './components/Navbar.vue'
import StatsCards from './components/StatsCards.vue'
import BomTable from './components/BomTable.vue'
import ModalAddItem from './components/ModalAddItem.vue'
import ModalNewProject from './components/ModalNewProject.vue'
import ModalEditItem from './components/ModalEditItem.vue' // <-- 1. Import Modal Edit

const showAddItemModal = ref(false)
const showNewProjectModal = ref(false)
const selectedItemToEdit = ref(null) // <-- 2. Menyimpan data item yang sedang diedit

const openEditModal = (item) => {
  selectedItemToEdit.value = item
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
    <div class="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      
      <!-- Navigasi & Action Buttons -->
      <Navbar @openNewProject="showNewProjectModal = true" />

      <!-- Kartu Ringkasan Statistik -->
      <StatsCards />

      <!-- Tabel BOM Utama -->
      <BomTable 
        @openAddItem="showAddItemModal = true" 
        @openEditItem="openEditModal" 
      />

      <!-- Modals -->
      <ModalAddItem v-if="showAddItemModal" @close="showAddItemModal = false" />
      <ModalNewProject v-if="showNewProjectModal" @close="showNewProjectModal = false" />
      
      <!-- Modal Edit Komponen -->
      <ModalEditItem 
        v-if="selectedItemToEdit" 
        :item="selectedItemToEdit" 
        @close="selectedItemToEdit = null" 
      />
      
    </div>
  </div>
</template>