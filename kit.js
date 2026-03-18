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
        window.location.href = "page.html";
      }, 5000);

      if (text) {
        text.addEventListener("animationend", () => {
          clearTimeout(fallbackTimer); // cancel fallback
          const holdTime = 2000; // extra time after animation
          setTimeout(() => {
            window.location.href = "page.html";
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
    helmet_title: "Welding Helmet",
    helmet_desc: "Protects the eyes and face from sparks, heat, and UV light.",
    gloves_title: "Hand Gloves",
    gloves_desc: "Protects the hands from burns and spatter.",
    clothing_title: "Protective Clothing",
    clothing_desc: "Shields the body from sparks and heat.",
    boots_title: "Safety Boots",
    boots_desc: "Protects the feet from falling metals and hot sparks.",
    tape_title: "Measuring Tape/Ruler",
    tape_desc: "Ensures accurate dimensions of pipes and materials.",
    brush_title: "Wire Brush",
    brush_desc: "For cleaning metal surfaces before and after welding.",
    pliers_title: "Pliers",
    pliers_desc: "For holding hot or small materials firmly.",
    files_title: "Files",
    files_desc: "For smoothing sharp edges after cutting/welding.",
    clamp_title: "Clamps",
    clamp_desc: "To hold workpieces in position during welding."
  },
  yo: {
    helmet_title: "Fọ́ọ̀mù Ìdábòbò Ojú",
    helmet_desc: "Daabobo oju ati oju lati iná, ooru, ati imọlẹ UV tó lewu.",
    gloves_title: "Àwọ̀n Aṣọ ọwọ́",
    gloves_desc: "Daabobo ọwọ́ lódì sí igbona àti iná kekere.",
    clothing_title: "Aṣọ Aabo",
    clothing_desc: "Daabobo ara lati iná ati ooru.",
    boots_title: "Bùùtù Aabo",
    boots_desc: "Daabobo ẹsẹ lati irin tó ń ṣubú àti iná gbígbóná.",
    tape_title: "Téépù Wíwọ / Àwọ̀n",
    tape_desc: "Fún ìwọn tó dájú ti irin àti ohun elo.",
    brush_title: "Búrúùṣì Wáyà",
    brush_desc: "Fún ìmúlò irin ṣáájú àti lẹ́yìn welding.",
    pliers_title: "Pliers",
    pliers_desc: "Fún mímú irin kekere tàbí gbígbóná.",
    files_title: "Fáìlì Irin",
    files_desc: "Láti ṣe dídán àti ṣíṣe àgbélébú.",
    clamp_title: "Kíláàmù",
    clamp_desc: "Láti dí irin mọ́ nípò nígbà welding."
  },
  ig: {
    helmet_title: "Ihe mkpuchi weld",
    helmet_desc: "Chebe anya na ihu site na ọkụ, okpomọkụ na ìhè UV dị ize ndụ.",
    gloves_title: "Uwe aka",
    gloves_desc: "Chekwaa aka pụọ na ọkụ na splatter.",
    clothing_title: "Uwe nchekwa",
    clothing_desc: "Chebe ahụ pụọ na ọkụ na okpomọkụ.",
    boots_title: "Akwụkwọ ụkwụ nchekwa",
    boots_desc: "Chekwaa ụkwụ site na ígwè na-adaba na ọkụ ọkụ.",
    tape_title: "Tepu / Rula",
    tape_desc: "Nye nha ziri ezi nke ígwè na ihe ndị ọzọ.",
    brush_title: "Brush waya",
    brush_desc: "Ijide n’aka na elu ígwè dị ọcha tupu na mgbe welding.",
    pliers_title: "Pliers",
    pliers_desc: "Ijide obere ma ọ bụ ígwè ọkụ nke ọma.",
    files_title: "Faịlụ ígwè",
    files_desc: "Maka ime ka akụkụ dị nro ma dozie ya.",
    clamp_title: "Klamps",
    clamp_desc: "Ijide ígwè ka ọ dị n’otu ebe n’oge welding."
  },
  ha: {
    helmet_title: "Hulɗar walda",
    helmet_desc: "Kare ido da fuska daga walƙiya, zafi, da hasken UV mai haɗari.",
    gloves_title: "Safar hannu",
    gloves_desc: "Kare hannaye daga kona da walƙiya ƙanana.",
    clothing_title: "Tufafin kariya",
    clothing_desc: "Kare jiki daga walƙiya da zafi.",
    boots_title: "Takalma na tsaro",
    boots_desc: "Kare ƙafa daga ƙarfe da ke faɗuwa da walƙiya mai zafi.",
    tape_title: "Tefin aunawa / Rula",
    tape_desc: "Don samun daidaitattun aunawa na ƙarfe da kayan aiki.",
    brush_title: "Buroshin waya",
    brush_desc: "Don tsaftace ƙarfe kafin da bayan walda.",
    pliers_title: "Fliers",
    pliers_desc: "Don riƙe ƙarfe ƙanana ko masu zafi sosai.",
    files_title: "Fayilolin ƙarfe",
    files_desc: "Don gyara da santsi gefuna bayan yankan/walda.",
    clamp_title: "Klamps",
    clamp_desc: "Don riƙe ƙarfe a wurin yayin walda."
  }
};

function setLanguage(lang) {
  document.querySelectorAll("[data-translate]").forEach(el => {
    const key = el.getAttribute("data-translate");
    el.textContent = translations[lang][key] || el.textContent;
  });
}
