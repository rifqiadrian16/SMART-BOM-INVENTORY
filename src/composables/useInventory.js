import { ref, computed } from 'vue'
import { supabase } from '../supabase'

const projects = ref([])
const activeProjectId = ref(null)
const isLoading = ref(true)

export function useInventory() {
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

  if (projects.value.length === 0) {
    fetchProjects()
  }

  const currentProject = computed(() => {
    return projects.value.find(p => p.id === activeProjectId.value) || projects.value[0] || null
  })

  const calculateOrder = (item) => {
    if (!currentProject.value) return 0
    const totalNeed = item.qty_per_pcb * currentProject.value.target_pcb
    const stock = item.stock || 0
    if (stock >= totalNeed) return 0
    const deficit = totalNeed - stock
    return item.auto_buffer ? Math.ceil(deficit * 1.3) : deficit
  }

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

  const deleteItemDB = async (id) => {
    if (confirm('Hapus komponen ini dari list?')) {
      const { error } = await supabase.from('bom_items').delete().eq('id', id)
      if (!error) {
        currentProject.value.bom_items = currentProject.value.bom_items.filter(i => i.id !== id)
      }
    }
  }

  const createProjectDB = async (name, targetPcb) => {
    const { data: newProj, error: projErr } = await supabase
      .from('projects')
      .insert([{ name, target_pcb: targetPcb }])
      .select()

    if (!projErr && newProj) {
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

  // FITUR BARU 1: Cetak Struk Order (Print / Simpan PDF) - HANYA BARANG KURANG
  const printOrderReceipt = () => {
    if (!currentProject.value) return
    
    // Filter HANYA barang yang butuh diorder
    const itemsToOrder = currentProject.value.bom_items.filter(item => calculateOrder(item) > 0)
    
    if (itemsToOrder.length === 0) {
      alert('🎉 Semua stok komponen untuk proyek ini sudah AMAN! Tidak ada yang perlu diorder.')
      return
    }

    let totalBudget = 0
    let rowsHtml = ''
    
    itemsToOrder.forEach((item, idx) => {
      const qty = calculateOrder(item)
      const subtotal = qty * (item.price || 0)
      totalBudget += subtotal
      rowsHtml += `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td>
            <strong>${item.name}</strong><br/>
            <small style="color: #666;">${item.category} | ${item.package}</small>
          </td>
          <td style="text-align: center; font-weight: bold; font-size: 14px;">${qty} pcs</td>
          <td style="text-align: right;">Rp ${new Intl.NumberFormat('id-ID').format(item.price || 0)}</td>
          <td style="text-align: right; font-weight: bold;">Rp ${new Intl.NumberFormat('id-ID').format(subtotal)}</td>
        </tr>
      `
    })

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Order - ${currentProject.value.name}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #111; max-width: 700px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px dashed #333; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; }
            .header p { margin: 5px 0 0; font-size: 12px; color: #555; }
            .meta { font-size: 13px; margin-bottom: 15px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
            th { border-bottom: 1px solid #333; padding: 8px 4px; text-align: left; background: #f4f4f4; }
            td { padding: 10px 4px; border-bottom: 1px dotted #ccc; vertical-align: top; }
            .total-box { border-top: 2px dashed #333; padding-top: 15px; text-align: right; font-size: 16px; }
            .total-box strong { font-size: 20px; }
            .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 15px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⚡ STRUK ORDER KOMPONEN ⚡</h1>
            <p>Daftar belanja material yang wajib dipesan (Sudah termasuk +30% Buffer)</p>
          </div>
          <div class="meta">
            <div><strong>Proyek:</strong> ${currentProject.value.name}</div>
            <div><strong>Target:</strong> ${currentProject.value.target_pcb} Board PCB</div>
            <div><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">No</th>
                <th>Nama Komponen & Spek</th>
                <th style="text-align: center;">Jml Order</th>
                <th style="text-align: right;">Harga @</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="total-box">
            Total Estimasi Biaya:<br/>
            <strong>Rp ${new Intl.NumberFormat('id-ID').format(totalBudget)}</strong>
          </div>
          <div class="footer">
            * Cek kembali package/footprint fisik (SMD/THT) sebelum membayar ke supplier.<br/>
            Digenerate otomatis oleh Smart BOM & Inventory System.
          </div>
          <script>
            window.onload = () => { window.print(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // FITUR BARU 2: Copy Format WhatsApp (Siap Kirim ke Toko / Admin WA)
  const copyWhatsAppOrder = () => {
    if (!currentProject.value) return
    const itemsToOrder = currentProject.value.bom_items.filter(item => calculateOrder(item) > 0)
    
    if (itemsToOrder.length === 0) {
      alert('🎉 Semua stok komponen aman! Tidak ada list untuk dicopy.')
      return
    }

    let waText = `*⚡ LIST ORDER KOMPONEN (${currentProject.value.name.toUpperCase()}) ⚡*\n`
    waText += `Target Perakitan: ${currentProject.value.target_pcb} Board PCB\n\n`
    waText += `Halo Gan/Min, mau order komponen elektronik berikut ya:\n\n`
    
    let totalBudget = 0
    itemsToOrder.forEach((item, idx) => {
      const qty = calculateOrder(item)
      const subtotal = qty * (item.price || 0)
      totalBudget += subtotal
      waText += `${idx + 1}. *${item.name}* (${item.package})\n`
      waText += `    └ 🛒 Order: *${qty} pcs* (@ Rp ${new Intl.NumberFormat('id-ID').format(item.price || 0)})\n`
    })

    waText += `\n---------------------------------\n`
    waText += `*Total Perkiraan: Rp ${new Intl.NumberFormat('id-ID').format(totalBudget)}*\n`
    waText += `---------------------------------\n`
    waText += `Mohon dicek ketersediaan stoknya. Terima kasih! 🙏`

    navigator.clipboard.writeText(waText).then(() => {
      alert('✅ Daftar order berhasil disalin ke Clipboard! Tinggal Paste (Ctrl+V) di WhatsApp admin toko.')
    }).catch(() => {
      alert('Gagal menyalin. Pastikan izin clipboard aktif di browser.')
    })
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
    printOrderReceipt,
    copyWhatsAppOrder
  }
}