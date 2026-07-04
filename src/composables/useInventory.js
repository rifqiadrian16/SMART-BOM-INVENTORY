import { ref, computed } from 'vue'
import { supabase } from '../supabase'

// State Global
const projects = ref([])
const activeProjectId = ref(null)
const isLoading = ref(true)

export function useInventory() {
  // 1. Fetch data dari Supabase (Projects beserta BOM items-nya)
  const fetchProjects = async () => {
    isLoading.value = true
    const { data, error } = await supabase
      .from('projects')
      .select('*, bom_items(*)')
      .order('created_at', { ascending: true })

    if (!error && data) {
      projects.value = data
      if (!activeProjectId.value && data.length > 0) {
        activeProjectId.value = data[0].id
      }
    } else {
      console.error('Gagal mengambil data:', error)
    }
    isLoading.value = false
  }

  // Jika state kosong, otomatis fetch saat composable dipanggil
  if (projects.value.length === 0) {
    fetchProjects()
  }

  const currentProject = computed(() => {
    return projects.value.find(p => p.id === activeProjectId.value) || projects.value[0] || null
  })

  // 2. Kalkulasi jumlah order + Buffer 30%
  const calculateOrder = (item) => {
    if (!currentProject.value) return 0
    const totalNeed = item.qty_per_pcb * currentProject.value.target_pcb
    const stock = item.stock || 0
    if (stock >= totalNeed) return 0
    const deficit = totalNeed - stock
    return item.auto_buffer ? Math.ceil(deficit * 1.3) : deficit
  }

  // 3. Update komponen langsung ke Database (Stok, Harga, atau Nama)
  const updateItemDB = async (item) => {
    const { error } = await supabase
      .from('bom_items')
      .update({
        name: item.name,
        category: item.category,
        package: item.package,
        qty_per_pcb: item.qty_per_pcb,
        stock: item.stock,
        price: item.price,
        auto_buffer: item.auto_buffer
      })
      .eq('id', item.id)

    if (error) console.error('Gagal update item:', error)
  }

  // 4. Tambah komponen baru ke proyek saat ini
  const addItemDB = async (newItemData) => {
    if (!currentProject.value) return
    const { data, error } = await supabase
      .from('bom_items')
      .insert([{ ...newItemData, project_id: currentProject.value.id }])
      .select()

    if (!error && data) {
      currentProject.value.bom_items.push(data[0])
    }
  }

  // 5. Hapus komponen dari Database
  const deleteItemDB = async (id) => {
    if (confirm('Hapus komponen ini dari list?')) {
      const { error } = await supabase.from('bom_items').delete().eq('id', id)
      if (!error) {
        currentProject.value.bom_items = currentProject.value.bom_items.filter(i => i.id !== id)
      }
    }
  }

  // 6. Buat Proyek Baru di Database
  const createProjectDB = async (name, targetPcb) => {
    const { data: newProj, error: projErr } = await supabase
      .from('projects')
      .insert([{ name, target_pcb: targetPcb }])
      .select()

    if (!projErr && newProj) {
      // Duplikasi template komponen dari proyek pertama ke proyek baru (dengan stok = 0)
      if (projects.value.length > 0) {
        const baseItems = projects.value[0].bom_items.map(i => ({
          project_id: newProj[0].id,
          category: i.category,
          name: i.name,
          package: i.package,
          qty_per_pcb: i.qty_per_pcb,
          stock: 0,
          price: i.price,
          auto_buffer: i.auto_buffer
        }))
        
        const { data: insertedItems } = await supabase.from('bom_items').insert(baseItems).select()
        newProj[0].bom_items = insertedItems || []
      } else {
        newProj[0].bom_items = []
      }

      projects.value.push(newProj[0])
      activeProjectId.value = newProj[0].id
    }
  }

  // 7. Reset Semua Stok di Proyek Saat Ini
  const resetCurrentStockDB = async () => {
    if (!currentProject.value) return
    if (confirm(`Reset semua stok di proyek "${currentProject.value.name}" ke 0?`)) {
      const { error } = await supabase
        .from('bom_items')
        .update({ stock: 0 })
        .eq('project_id', currentProject.value.id)

      if (!error) {
        currentProject.value.bom_items.forEach(i => i.stock = 0)
      }
    }
  }

  // 8. Export ke CSV (Tetap sama, disesuaikan dengan penamaan kolom baru)
  const exportToCSV = () => {
    if (!currentProject.value) return
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "Kategori,Nama Komponen,Package,Butuh per PCB,Target PCB,Total Butuh,Stok Saat Ini,WAJIB ORDER (Pcs),Est. Harga Satuan,Subtotal Harga\r\n"

    currentProject.value.bom_items.forEach(item => {
      const orderQty = calculateOrder(item)
      if (orderQty > 0) {
        const row = [
          `"${item.category}"`, `"${item.name}"`, `"${item.package}"`,
          item.qty_per_pcb, currentProject.value.target_pcb, (item.qty_per_pcb * currentProject.value.target_pcb),
          (item.stock || 0), orderQty, (item.price || 0), (orderQty * (item.price || 0))
        ].join(",")
        csvContent += row + "\r\n"
      }
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Order_List_${currentProject.value.name.replace(/\s+/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return {
    projects,
    activeProjectId,
    currentProject,
    isLoading,
    calculateOrder,
    fetchProjects,
    updateItemDB,
    addItemDB,
    deleteItemDB,
    createProjectDB,
    resetCurrentStockDB,
    exportToCSV
  }
}