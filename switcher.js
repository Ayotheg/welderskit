document.addEventListener('DOMContentLoaded', () => {
    const langBtns = document.querySelectorAll('.lang-btn');
    const langSections = document.querySelectorAll('[data-lang]');

    function setLanguage(lang) {
        // Update buttons
        langBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.target === lang);
        });

        // Update content
        langSections.forEach(section => {
            section.classList.toggle('active-lang', section.dataset.lang === lang);
        });

        // Save preference
        localStorage.setItem('preferred-lang', lang);
    }

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedLang = btn.dataset.target;
            setLanguage(selectedLang);
        });
    });

    // Load preference if it exists
    const savedLang = localStorage.getItem('preferred-lang') || 'en';
    setLanguage(savedLang);
});
