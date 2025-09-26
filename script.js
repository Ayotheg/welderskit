if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(() => console.log("Service Worker registered!"))
    .catch(err => console.error("SW registration failed:", err));
}


window.addEventListener("load", () => {
  if (window.innerWidth < 768) {
    // Show mobile content, hide desktop message
    document.querySelector(".mobile-content").style.display = "block";
    document.querySelector(".desktop-message").style.display = "none";

    // Only redirect if not yet marked as played in this visit
    if (!sessionStorage.getItem("introPlayed")) {
      sessionStorage.setItem("introPlayed", "true");

      const text = document.getElementById("text-home");

      // Fallback redirect (e.g. 5 seconds after load, even if animation fails)
      const fallbackTimer = setTimeout(() => {
        window.location.href = "login.html";
      }, 5000);

      if (text) {
        text.addEventListener("animationend", () => {
          clearTimeout(fallbackTimer); // cancel fallback
          const holdTime = 2000; // extra time after animation
          setTimeout(() => {
            window.location.href = "login.html";
          }, holdTime);
        });
      }
    }
    // If introPlayed already set → do nothing (let them stay on index.html)
  } else {
    // Desktop case
    document.querySelector(".mobile-content").style.display = "none";
    document.querySelector(".desktop-message").style.display = "block";
  }
});


const translations = {
  en: {
    helmet_title: "Helmet",
    helmet_desc: "Protects eyes and face from sparks and harmful UV light",
    machine_title: "Welding Machine",
    machine_desc: "Generates the heat needed to melt and fuse metals.",
    electrode_title: "Electrodes/Rods",
    electrode_desc: "Provide filler metal for joining materials during welding.",
    brush_title: "Wire Brush",
    brush_desc: "Cleans metal surfaces before and after welding.",
    tape_title: "Measuring Tape/Ruler",
    tape_desc: "Ensures accurate dimensions of pipes and materials.",
    clamp_title: "Clamps",
    clamp_desc: "Hold workpieces firmly in place while welding."
  },
  yo: {
    helmet_title: "Fila Alurinmorin",
    helmet_desc: "Daaboju oju ati oju lati awọn iná ati imọlẹ UV ipalara.",
    machine_title: "Ẹrọ Alurinmorin",
    machine_desc: "O n ṣẹda ooru lati yo ati darapọ irin.",
    electrode_title: "Ẹlẹ́tọ̀rọ̀ọ̀du/Rodu",
    electrode_desc: "Pese irin afikun fun didapọ awọn ohun elo nigba alurinmorin.",
    brush_title: "Bọ́ọ̀sì Waya",
    brush_desc: "Mọ dada irin ṣaaju ati lẹ́yìn alurinmorin.",
    tape_title: "Teepu Iwọn / Ìgòòṣà",
    tape_desc: "Ṣe idaniloju wiwọn pipe fun awọn paipu ati ohun elo.",
    clamp_title: "Klampa",
    clamp_desc: "Mu irin pọ mọ́ra nigba alurinmorin."
  },
  ig: {
    helmet_title: "Ihe mkpuchi isi",
    helmet_desc: "Na-echebe anya na ihu pụọ na ọkụ na ọkụ UV dị ize ndụ.",
    machine_title: "Ngwaọrụ ịgbado ọkụ",
    machine_desc: "Na-emepụta okpomọkụ iji kpochapụ ma jikọta ígwè ọnụ.",
    electrode_title: "Electrode / Ọkpọkọ",
    electrode_desc: "Na-enye ígwè mgbakwunye iji jikọta ihe n'oge ịgbado ọkụ.",
    brush_title: "Ahịhịa waya",
    brush_desc: "Na-ehicha elu ígwè tupu na mgbe ịgbado ọkụ gasịrị.",
    tape_title: "Tepu tụọ / Rula",
    tape_desc: "Na-eme ka ntụpọ na nha nke pipes na ihe dị mma.",
    clamp_title: "Klamps",
    clamp_desc: "Na-ejide ihe ka ha guzosie ike n'oge ịgbado ọkụ."
  },
  ha: {
    helmet_title: "Hular Walda",
    helmet_desc: "Yana kare ido da fuska daga wuta da hasken UV mai haɗari.",
    machine_title: "Na’urar Walda",
    machine_desc: "Yana samar da zafi da ake buƙata domin narkar da haɗa ƙarfe.",
    electrode_title: "Electrode / Sanduna",
    electrode_desc: "Yana ba da ƙarfe kariya don haɗa abubuwa yayin walda.",
    brush_title: "Buroshin Waya",
    brush_desc: "Yana tsabtace saman ƙarfe kafin da bayan walda.",
    tape_title: "Tef na auna / Ma'auni",
    tape_desc: "Yana tabbatar da madaidaicin auna bututu da kayan aiki.",
    clamp_title: "Klamps",
    clamp_desc: "Yana riƙe ƙarfe sosai yayin walda."
  }
};

function setLanguage(lang) {
  document.querySelectorAll("[data-translate]").forEach(el => {
    const key = el.getAttribute("data-translate").trim();
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}


