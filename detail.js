document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get("id");

  if (!campaignId) {
    document.body.innerHTML = "<h1>Error: ID Kampanye tidak ditemukan.</h1>";
    return;
  }

  fetch("/api/user", { credentials: "include" })
    .then((res) => {
      if (!res.ok) {
        document.getElementById("username-display").textContent = "Tamu";
        const logoutButton = document.querySelector('a[href="/logout"]');
        if (logoutButton) logoutButton.style.display = "none";
        return null;
      }
      return res.json();
    })
    .then((data) => {
      if (data && data.username) {
        document.getElementById("username-display").textContent = data.username;
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
      document.getElementById("username-display").textContent = "Tamu";
    });

  const loadCampaignDetail = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (!response.ok) throw new Error("Kampanye tidak ditemukan.");
      const campaign = await response.json();

      document.title = `${campaign.title} - Semuabisa.com`;
      document.getElementById("campaign-image").src =
        campaign.image_url || "https://via.placeholder.com/800x600";
      document.getElementById("campaign-title").textContent = campaign.title;
      document.getElementById("campaign-description").textContent =
        campaign.description;

      const formatRupiah = (num) => `Rp ${Number(num).toLocaleString("id-ID")}`;
      document.getElementById("current-amount").textContent = formatRupiah(
        campaign.current_amount
      );
      document.getElementById("target-amount").textContent = formatRupiah(
        campaign.target_amount
      );

      const percentage =
        (campaign.current_amount / campaign.target_amount) * 100;
      document.getElementById("progress-bar").style.width = `${percentage}%`;
    } catch (error) {
      document.getElementById(
        "campaign-detail-container"
      ).innerHTML = `<h1 class='text-red-500'>${error.message}</h1>`;
    }
  };

  const handleDonationSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const donationData = {
      nama: formData.get("nama"),
      nominal: formData.get("nominal"),
      pesan: formData.get("pesan"),
      campaignId: campaignId,
    };

    try {
      const response = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(donationData),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal mengirim donasi.");

      showSuccessModal("Terima kasih! Donasi Anda telah berhasil diterima.");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  loadCampaignDetail();
  document
    .getElementById("donation-form")
    .addEventListener("submit", handleDonationSubmit);
});

function showSuccessModal(message) {
  const modal = document.getElementById("success-modal");
  const modalMessage = document.getElementById("modal-message");
  const closeButton = document.getElementById("modal-close-btn");

  modalMessage.textContent = message;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  closeButton.onclick = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");

    window.location.reload();
  };
}
