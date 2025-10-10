document.addEventListener('DOMContentLoaded', () => {
  const loadUserData = async () => {
    const usernameDisplay = document.getElementById('username-display');
    if (!usernameDisplay) return;

    try {
      const response = await fetch('/api/user');
      if (!response.ok) {
        usernameDisplay.textContent = 'Tamu';
        return;
      }
      const user = await response.json();
      usernameDisplay.textContent = user.username;
    } catch (error) {
      console.error('Gagal memuat data user:', error);
      usernameDisplay.textContent = 'Tamu';
    }
  };

  const loadCampaigns = async () => {
    const campaignContainer = document.getElementById('campaign-container');
    if (!campaignContainer) return;

    const apiUrl = '/api/campaigns';
    campaignContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">Memuat program donasi...</p>';
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Gagal mengambil data.');
      const campaigns = await response.json();

      campaignContainer.innerHTML = '';
      if (campaigns.length === 0) {
        campaignContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">Belum ada program donasi.</p>';
      } else {
        campaigns.forEach(campaign => {
          campaignContainer.insertAdjacentHTML('beforeend', createCampaignCard(campaign));
        });
      }
    } catch (error) {
      console.error('Error:', error);
      campaignContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">Gagal memuat data. Silakan coba lagi nanti.</p>';
    }
  };

  const createCampaignCard = (campaign) => {
    const percentage = Math.min((campaign.current_amount / campaign.target_amount) * 100, 100).toFixed(0);
    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
    return `
      <div class="border rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 flex flex-col bg-gray-50">
        <img src="${campaign.image_url || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80'}" alt="${campaign.title}" class="w-full h-52 object-cover">
        <div class="p-5 flex flex-col flex-grow">
          <h3 class="text-lg font-bold text-gray-800 mb-2">${campaign.title}</h3>
          <p class="text-sm text-gray-600 mb-4 flex-grow">${campaign.description || 'Tidak ada deskripsi.'}</p>
          <div class="w-full bg-gray-200 rounded-full h-3 mb-2"><div class="bg-blue-600 h-3 rounded-full" style="width: ${percentage}%"></div></div>
          <div class="flex justify-between text-sm text-gray-700">
            <div><span class="font-semibold">Terkumpul</span><p class="font-bold">${formatRupiah(campaign.current_amount)}</p></div>
            <div class="text-right"><span class="font-semibold">Target</span><p>${formatRupiah(campaign.target_amount)}</p></div>
          </div>
        </div>
        <div class="p-5 border-t mt-auto bg-white"><a href="detail-kampanye.html?id=${campaign.id}" class="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition">
  Donasi Sekarang
</a></div>
      </div>
    `;
  };

  loadUserData();
  loadCampaigns();
});