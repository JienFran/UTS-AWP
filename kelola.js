document.addEventListener('DOMContentLoaded', () => {
    loadStats();
});

async function loadStats() {
  try {
    const [totalDonasiRes, jumlahDonaturRes, totalKampanyeRes] = await Promise.all([
      fetch('/api/stats/total-donasi'),
      fetch('/api/stats/jumlah-donatur'),
      fetch('/api/stats/total-kampanye')
    ]);

    if (!totalDonasiRes.ok || !jumlahDonaturRes.ok || !totalKampanyeRes.ok) {
      throw new Error('Gagal mengambil salah satu data statistik.');
    }

    const totalDonasiData = await totalDonasiRes.json();
    const jumlahDonaturData = await jumlahDonaturRes.json();
    const totalKampanyeData = await totalKampanyeRes.json();

    document.getElementById('totalDonasi').innerText = `Rp ${Number(totalDonasiData.totalDonasi).toLocaleString('id-ID')}`;
    document.getElementById('totalDonatur').innerText = jumlahDonaturData.jumlahDonatur;
    document.getElementById('totalKampanye').innerText = totalKampayeData.totalKampanye;

  } catch (err) {
    console.error('Gagal memuat statistik:', err);
    document.getElementById('totalDonasi').innerText = 'Error';
    document.getElementById('totalDonatur').innerText = 'Error';
    document.getElementById('totalKampanye').innerText = 'Error';
  }
}
async function loadDonasi() {
  try {
    const res = await fetch('/api/admin/donasi');
    const data = await res.json();
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    data.forEach((d) => {
      tbody.innerHTML += `
        <tr class="border-b hover:bg-blue-50 transition-colors">
          <td class="py-2 px-3 text-center font-medium text-gray-700">${d.id}</td>
          <td class="py-2 px-3 text-gray-800">${d.nama_donatur}</td>
          <td class="py-2 px-3 text-right text-gray-800 font-semibold">Rp ${Number(d.nominal).toLocaleString('id-ID')}</td>
          <td class="py-2 px-3 text-gray-600">${d.pesan || '-'}</td>
          <td class="py-2 px-3 text-gray-600">${new Date(d.tanggal).toLocaleDateString('id-ID')}</td>
          <td class="py-2 px-3 text-center space-x-2">
            <button onclick="editDonasi(${d.id}, '${d.nama_donatur}', ${d.nominal}, '${d.pesan || ''}')"
              class="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
              Edit
            </button>
            <button onclick="hapusDonasi(${d.id})"
              class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors shadow-sm">
              Hapus
            </button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Gagal memuat data donasi:', err);
  }
}

async function hapusDonasi(id) {
  if (!confirm('Yakin ingin menghapus donasi ini?')) return;
  await fetch(`/api/admin/donasi/${id}`, {
    method: 'DELETE'
  });
  loadDonasi();
}

function editDonasi(id, nama, nominal, pesan) {
  const newNama = prompt('Nama Donatur:', nama);
  if (newNama === null) return;

  const newNominal = prompt('Nominal (Rp):', nominal);
  if (newNominal === null) return;

  const newPesan = prompt('Pesan (opsional):', pesan);

  fetch(`/api/admin/donasi/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nama_donatur: newNama,
        nominal: newNominal,
        pesan: newPesan
      })
    })
    .then((res) => res.json())
    .then((result) => {
      alert(result.message);
      loadDonasi();
    })
    .catch((err) => console.error('Gagal update data:', err));
}

loadStats();
loadDonasi();