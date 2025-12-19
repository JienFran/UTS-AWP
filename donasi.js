document.addEventListener("DOMContentLoaded", () => {
  const loadUserData = async () => {
    const usernameDisplay = document.getElementById("username-display");
    if (!usernameDisplay) return;

    try {
      const response = await fetch("/api/user", {
        credentials: "include",
      });

      if (!response.ok) {
        usernameDisplay.textContent = "Tamu";
        return;
      }

      const user = await response.json();
      usernameDisplay.textContent = user.username;
    } catch (error) {
      console.error("Gagal memuat data user:", error);
      usernameDisplay.textContent = "Tamu";
    }
  };

  const loadCampaigns = async (keyword = "") => {
    const campaignContainer = document.getElementById("campaign-container");
    if (!campaignContainer) return;

    campaignContainer.innerHTML =
      '<p class="text-center text-gray-500 col-span-full py-10 animate-pulse">Memuat program donasi...</p>';

    try {
      const apiUrl = `/api/campaigns-public?search=${encodeURIComponent(
        keyword
      )}`;

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Gagal mengambil data.");
      const campaigns = await response.json();

      campaignContainer.innerHTML = "";

      if (campaigns.length === 0) {
        campaignContainer.innerHTML = `
          <div class="text-center col-span-full py-10">
             <p class="text-gray-500 text-lg mb-2">Program donasi tidak ditemukan.</p>
             ${
               keyword
                 ? '<button onclick="location.reload()" class="text-blue-600 hover:underline">Tampilkan Semua</button>'
                 : ""
             }
          </div>
        `;
      } else {
        campaigns.forEach((campaign) => {
          campaignContainer.insertAdjacentHTML(
            "beforeend",
            createCampaignCard(campaign)
          );
        });
      }
    } catch (error) {
      console.error("Error:", error);
      campaignContainer.innerHTML =
        '<p class="text-center text-red-500 col-span-full">Gagal memuat data. Silakan coba lagi nanti.</p>';
    }
  };

  const createCampaignCard = (campaign) => {
    const percentage = Math.min(
      (campaign.current_amount / campaign.target_amount) * 100,
      100
    ).toFixed(0);

    const formatRupiah = (number) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(number);

    return `
      <div class="border rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 flex flex-col bg-gray-50 h-full">
        <div class="relative h-52 overflow-hidden group">
          <img src="${
            campaign.image_url ||
            "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80"
          }" 
             alt="${campaign.title}" 
             class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
          <div class="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
             Active
          </div>
        </div>
        
        <div class="p-5 flex flex-col flex-grow">
          <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2" title="${
            campaign.title
          }">${campaign.title}</h3>
          
          <p class="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
            ${campaign.description || "Tidak ada deskripsi."}
          </p>
          
          <div class="mt-auto">
            <div class="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
               <div class="bg-blue-600 h-3 rounded-full transition-all duration-1000" style="width: ${percentage}%"></div>
            </div>
            
            <div class="flex justify-between text-sm text-gray-700 mb-4">
              <div>
                <span class="block text-xs text-gray-500">Terkumpul</span>
                <span class="font-bold text-blue-700">${formatRupiah(
                  campaign.current_amount
                )}</span>
              </div>
              <div class="text-right">
                <span class="block text-xs text-gray-500">Target</span>
                <span class="font-bold">${formatRupiah(
                  campaign.target_amount
                )}</span>
              </div>
            </div>

            <a href="detail-kampanye.html?id=${campaign.id}" 
               class="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition transform hover:-translate-y-1">
               Donasi Sekarang
            </a>
          </div>
        </div>
      </div>
    `;
  };

  const btnSearch = document.getElementById("btnUserSearch");
  const inputSearch = document.getElementById("userSearchInput");

  if (btnSearch && inputSearch) {
    btnSearch.addEventListener("click", () => {
      const keyword = inputSearch.value.trim();
      loadCampaigns(keyword);
    });

    inputSearch.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const keyword = inputSearch.value.trim();
        loadCampaigns(keyword);
      }
    });
  }

  loadUserData();
  loadCampaigns();
});
