const apiUrl = '/api/donasi';
const form = document.getElementById('donasiForm');
const table = document.getElementById('donasiTable');

async function loadData() {
  const res = await fetch(apiUrl);
  const data = await res.json();

  table.innerHTML = data.map(d => `
    <tr class="border hover:bg-blue-50 transition">
      <td class="p-2">${d.id}</td>
      <td class="p-2 font-medium">${d.nama_donatur}</td>
      <td class="p-2 text-blue-700 font-semibold">Rp${parseInt(d.nominal).toLocaleString('id-ID')}</td>
      <td class="p-2">${d.pesan || '-'}</td>
      <td class="p-2">${new Date(d.tanggal).toLocaleString('id-ID')}</td>
      <td class="p-2">
        <button onclick="editData(${d.id}, '${d.nama_donatur}', ${d.nominal}, '${d.pesan || ''}')"
          class="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
        <button onclick="hapusData(${d.id})"
          class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Hapus</button>
      </td>
    </tr>
  `).join('');
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const nama = document.getElementById('nama').value.trim();
  const nominal = parseInt(document.getElementById('nominal').value);
  const pesan = document.getElementById('pesan').value.trim();

  if (!nama || nominal <= 0) return alert('Nama dan nominal harus valid!');

  await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nama_donatur: nama, nominal, pesan })
  });

  form.reset();
  loadData();
});

async function hapusData(id) {
  if (confirm('Yakin ingin menghapus data ini?')) {
    await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
    loadData();
  }
}

async function editData(id, nama, nominal, pesan) {
  const newNama = prompt('Ubah nama:', nama);
  const newNominal = prompt('Ubah nominal:', nominal);
  const newPesan = prompt('Ubah pesan:', pesan);

  if (!newNama || newNominal <= 0) return alert('Input tidak valid!');

  await fetch(`${apiUrl}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nama_donatur: newNama,
      nominal: newNominal,
      pesan: newPesan
    })
  });

  loadData();
}

loadData();
