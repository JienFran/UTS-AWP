// (Isi kode JavaScript sama persis seperti jawaban saya sebelumnya)
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');

  if (!campaignId) {
    document.body.innerHTML = '<h1>Error: ID Kampanye tidak ditemukan.</h1>';
    return;
  }
  
  fetch('/api/user').then(res => res.json()).then(data => {
    if(data.username) document.getElementById('username-display').textContent = data.username;
  });

  const loadCampaignDetail = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (!response.ok) throw new Error('Kampanye tidak ditemukan.');
      const campaign = await response.json();

      document.title = `${campaign.title} - Semuabisa.com`;
      document.getElementById('campaign-image').src = campaign.image_url || 'https://via.placeholder.com/800x600';
      document.getElementById('campaign-title').textContent = campaign.title;
      document.getElementById('campaign-description').textContent = campaign.description;
      
      const formatRupiah = (num) => `Rp ${Number(num).toLocaleString('id-ID')}`;
      document.getElementById('current-amount').textContent = formatRupiah(campaign.current_amount);
      document.getElementById('target-amount').textContent = formatRupiah(campaign.target_amount);

      const percentage = (campaign.current_amount / campaign.target_amount) * 100;
      document.getElementById('progress-bar').style.width = `${percentage}%`;

    } catch (error) {
      document.getElementById('campaign-detail-container').innerHTML = `<h1 class='text-red-500'>${error.message}</h1>`;
    }
  };
  
  const handleDonationSubmit = async (event) => {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const donationData = {
      nama_donatur: formData.get('nama'),
      nominal: formData.get('nominal'),
      pesan: formData.get('pesan'),
      campaign_id: campaignId
    };
    
    try {
      const response = await fetch('/api/donasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData)
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Gagal mengirim donasi.');
      
      alert('Terima kasih! Donasi Anda telah berhasil dikirim.');
      window.location.href = '/main.html';
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  loadCampaignDetail();
  document.getElementById('donation-form').addEventListener('submit', handleDonationSubmit);
});