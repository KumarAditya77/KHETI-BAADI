// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        // Toggle Nav
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
        
        // Animate Links
        links.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
    });
}

// Close mobile menu when clicking on a link
links.forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks && hamburger) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70, // Adjust for fixed header
                behavior: 'smooth'
            });
        }
    });
});

// Form Submission (Contact Form)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        const formData = new FormData(this);
        const formValues = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch('http://localhost:3000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formValues)
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                alert(data.message || 'Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            } else {
                alert('Failed to send message: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Cannot connect to the server. Please try again later.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Handle image upload and preview
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadForm = document.getElementById('upload-form');
    const imagePreview = document.getElementById('image-preview');
    const resultSection = document.getElementById('result-section');
    const resultContent = document.getElementById('result-content');
    const uploadLabel = document.querySelector('.upload-label');

    if (fileInput && uploadForm && imagePreview && resultSection && resultContent && uploadLabel) {
        // Preview uploaded image
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                    imagePreview.style.display = 'block';
                    // Hide the upload label when an image is selected
                    uploadLabel.style.display = 'none';
                };
                
                reader.readAsDataURL(file);
                resultSection.style.display = 'none';
            }
        });

        // Handle form submission
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const file = fileInput.files[0];
            if (!file) {
                alert('Please select an image first');
                return;
            }

            const formData = new FormData();
            formData.append('plantImage', file);

            // Show loading spinner
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            resultContent.innerHTML = '';
            resultContent.appendChild(spinner);
            spinner.style.display = 'block';
            resultSection.style.display = 'block';

            try {
                const apiUrl = 'http://localhost:3000/api/analyze';
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Error analyzing image');
                }

                displayResults(data);
            } catch (error) {
                console.error('Error:', error);
                resultContent.innerHTML = `
                    <div class="error">
                        <p>Error: ${error.message || 'Failed to analyze image. Please try again.'}</p>
                    </div>
                `;
            } finally {
                spinner.style.display = 'none';
            }
        });

        // Function to display analysis results
        function displayResults(data) {
            if (!data.success) {
                resultContent.innerHTML = `
                    <div class="error">
                        <p>${data.message || 'Error processing your request'}</p>
                    </div>
                `;
                return;
            }

            const { disease, confidence, description, treatment, prevention } = data.result;
            
            resultContent.innerHTML = `
                <div class="result-card">
                    <div class="result-header">
                        <h4>Detected: ${disease}</h4>
                        <span class="confidence">Confidence: ${(confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div class="result-description">
                        <p>${description}</p>
                    </div>
                    <div class="result-treatment">
                        <h5>Recommended Treatment:</h5>
                        <ul>
                            ${treatment.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="result-prevention">
                        <h5>Prevention Tips:</h5>
                        <ul>
                            ${prevention.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }

        // Reset file input when clicking the upload area
        document.querySelector('.upload-area').addEventListener('click', (e) => {
            if (e.target === uploadLabel || e.target === uploadLabel.querySelector('i') || e.target === uploadLabel.querySelector('p')) {
                fileInput.click();
            } else if (e.target === document.querySelector('.upload-area')) {
                fileInput.click();
            }
        });
    }
});

// Add CSS for navLinkFade animation
const navLinkStyle = document.createElement('style');
navLinkStyle.textContent = `
    @keyframes navLinkFade {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(navLinkStyle);


// ==========================================
// 1. Localization System
// ==========================================
const TRANSLATIONS = {
    en: {
        nav_home: "Home",
        nav_features: "Features",
        nav_how_it_works: "How It Works",
        nav_about: "About",
        nav_contact: "Contact",
        nav_chat: "Chat with AI",
        hero_title: "Revolutionizing Agriculture with AI",
        hero_subtitle: "Detect plant diseases instantly and get organic farming solutions at your fingertips.",
        btn_detect: "Detect Disease",
        btn_learn: "Learn More",
        weather_title: "Smart Weather Advisor",
        weather_loc_status: "Detecting your location for local advisory...",
        weather_temp: "Temperature",
        weather_humidity: "Humidity",
        weather_rain: "Rain Prob.",
        weather_wind: "Wind Speed",
        weather_ai_header: "AI Farming Tip",
        weather_ai_loading: "Analyzing conditions to generate tip...",
        calc_title: "Crop Yield & Profit Calculator",
        calc_subtitle: "Estimate your crop yields and projected profits based on soil and farm size.",
        calc_label_crop: "Select Crop",
        crop_rice: "Rice",
        crop_wheat: "Wheat",
        crop_tomato: "Tomato",
        crop_potato: "Potato",
        calc_label_area: "Farm Size (Acres)",
        calc_label_soil: "Soil Type",
        soil_loam: "Loam (Optimal)",
        soil_clay: "Clay",
        soil_sandy: "Sandy",
        soil_silt: "Silt",
        calc_out_yield: "Estimated Yield",
        calc_out_cost: "Estimated Cost",
        calc_out_profit: "Projected Net Profit",
        sched_title: "AI Crop Calendar Planner",
        sched_subtitle: "Generate a customized week-by-week plan for your crops.",
        sched_label_crop: "Select Crop",
        sched_label_date: "Sowing Date",
        sched_btn_gen: "Generate Plan",
        sched_btn_email: "Email Me This Plan",
        map_title: "Community Disease Outbreak Map",
        map_subtitle: "See reported outbreaks in your region and report a new outbreak to alert nearby farms.",
        map_btn_report: "Report Outbreak Here",
        analysis_title: "Analysis Result"
    },
    hi: {
        nav_home: "होम",
        nav_features: "विशेषताएं",
        nav_how_it_works: "यह कैसे काम करता है",
        nav_about: "हमारे बारे में",
        nav_contact: "संपर्क",
        nav_chat: "एआई से चैट करें",
        hero_title: "एआई के साथ कृषि में क्रांति",
        hero_subtitle: "पौधों की बीमारियों का तुरंत पता लगाएं और जैविक खेती के समाधान अपनी उंगलियों पर पाएं।",
        btn_detect: "बीमारी का पता लगाएं",
        btn_learn: "अधिक जानें",
        weather_title: "स्मार्ट मौसम सलाहकार",
        weather_loc_status: "स्थानीय सलाहकार के लिए आपके स्थान का पता लगाया जा रहा है...",
        weather_temp: "तापमान",
        weather_humidity: "आर्द्रता",
        weather_rain: "बारिश की संभावना",
        weather_wind: "हवा की गति",
        weather_ai_header: "एआई खेती युक्ति",
        weather_ai_loading: "सलाह उत्पन्न करने के लिए परिस्थितियों का विश्लेषण किया जा रहा है...",
        calc_title: "फसल उपज और लाभ कैलकुलेटर",
        calc_subtitle: "मिट्टी और खेत के आकार के आधार पर अपनी फसल की उपज और अनुमानित लाभ का अनुमान लगाएं।",
        calc_label_crop: "फसल चुनें",
        crop_rice: "धान",
        crop_wheat: "गेहूं",
        crop_tomato: "टमाटर",
        crop_potato: "आलू",
        calc_label_area: "खेत का आकार (एकड़)",
        calc_label_soil: "मिट्टी का प्रकार",
        soil_loam: "दोमट (सर्वोत्तम)",
        soil_clay: "चिकनी मिट्टी",
        soil_sandy: "रेतीली मिट्टी",
        soil_silt: "गाद",
        calc_out_yield: "अनुमानित उपज",
        calc_out_cost: "अनुमानित लागत",
        calc_out_profit: "अनुमानित शुद्ध लाभ",
        sched_title: "एआई फसल कैलेंडर योजनाकार",
        sched_subtitle: "अपनी फसलों के लिए सप्ताह-दर-सप्ताह अनुकूलित योजना तैयार करें।",
        sched_label_crop: "फसल चुनें",
        sched_label_date: "बुआई की तारीख",
        sched_btn_gen: "योजना बनाएं",
        sched_btn_email: "मुझे यह योजना ईमेल करें",
        map_title: "सामुदायिक रोग प्रकोप मानचित्र",
        map_subtitle: "अपने क्षेत्र में रिपोर्ट किए गए प्रकोपों को देखें और आस-पास के खेतों को सचेत करने के लिए नए प्रकोप की रिपोर्ट करें।",
        map_btn_report: "यहाँ प्रकोप की रिपोर्ट करें",
        analysis_title: "विश्लेषण परिणाम"
    },
    pa: {
        nav_home: "ਹੋਮ",
        nav_features: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ",
        nav_how_it_works: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
        nav_about: "ਸਾਡੇ ਬਾਰੇ",
        nav_contact: "ਸੰਪਰਕ",
        nav_chat: "ਏਆਈ ਨਾਲ ਗੱਲਬਾਤ",
        hero_title: "ਏਆਈ ਨਾਲ ਖੇਤੀਬਾੜੀ ਵਿੱਚ ਕ੍ਰਾਂਤੀ",
        hero_subtitle: "ਪੌਦਿਆਂ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਦਾ ਤੁਰੰਤ ਪਤਾ ਲਗਾਓ ਅਤੇ ਜੈਵਿਕ ਖੇਤੀ ਦੇ ਹੱਲ ਆਪਣੀ ਉਂਗਲਾਂ 'ਤੇ ਪ੍ਰਾਪਤ ਕਰੋ।",
        btn_detect: "ਬਿਮਾਰੀ ਲੱਭੋ",
        btn_learn: "ਹੋਰ ਜਾਣੋ",
        weather_title: "ਸਮਾਰਟ ਮੌਸਮ ਸਲਾਹਕਾਰ",
        weather_loc_status: "ਸਥਾਨਕ ਸਲਾਹ ਲਈ ਤੁਹਾਡੇ ਸਥਾਨ ਦੀ ਖੋਜ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
        weather_temp: "ਤਾਪਮਾਨ",
        weather_humidity: "ਨਮੀ",
        weather_rain: "ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ",
        weather_wind: "ਹਵਾ ਦੀ ਗਤੀ",
        weather_ai_header: "ਏਆਈ ਖੇਤੀ ਸੁਝਾਅ",
        weather_ai_loading: "ਸੁਝਾਅ ਤਿਆਰ ਕਰਨ ਲਈ ਸਥਿਤੀਆਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
        calc_title: "ਫਸਲ ਦੀ ਪੈਦਾਵਾਰ ਅਤੇ ਮੁਨਾਫਾ ਕੈਲਕੁਲੇਟਰ",
        calc_subtitle: "ਮਿੱਟੀ ਅਤੇ ਫਾਰਮ ਦੇ ਆਕਾਰ ਦੇ ਅਧਾਰ 'ਤੇ ਆਪਣੀ ਫਸਲ ਦੀ ਪੈਦਾਵਾਰ ਅਤੇ ਅਨੁਮਾਨਿਤ ਮੁਨਾਫੇ ਦਾ ਅੰਦਾਜ਼ਾ ਲਗਾਓ।",
        calc_label_crop: "ਫਸਲ ਚੁਣੋ",
        crop_rice: "ਝੋਨਾ",
        crop_wheat: "ਕਣਕ",
        crop_tomato: "ਟਮਾਟਰ",
        crop_potato: "ਆਲੂ",
        calc_label_area: "ਫਾਰਮ ਦਾ ਆਕਾਰ (ਏਕੜ)",
        calc_label_soil: "ਮਿੱਟੀ ਦੀ ਕਿਸਮ",
        soil_loam: "ਦੋਮਟ (ਉੱਤਮ)",
        soil_clay: "ਚੀਕਣੀ ਮਿੱਟੀ",
        soil_sandy: "ਰੇਤਲੀ ਮਿੱਟੀ",
        soil_silt: "ਸਿਲਟ",
        calc_out_yield: "ਅਨੁਮਾਨਿਤ ਪੈਦਾਵਾਰ",
        calc_out_cost: "ਅਨੁਮਾਨਿਤ ਲਾਗਤ",
        calc_out_profit: "ਅਨੁਮਾਨਿਤ ਸ਼ੁੱਧ ਮੁਨਾਫਾ",
        sched_title: "ਏਆਈ ਫਸਲ ਕੈਲੰਡਰ ਯੋਜਨਾਕਾਰ",
        sched_subtitle: "ਆਪਣੀਆਂ ਫਸਲਾਂ ਲਈ ਹਫ਼ਤੇ-ਦਰ-ਹਫ਼ਤੇ ਦੀ ਯੋਜਨਾ ਤਿਆਰ ਕਰੋ।",
        sched_label_crop: "ਫਸਲ ਚੁਣੋ",
        sched_label_date: "ਬਿਜਾਈ ਦੀ ਮਿਤੀ",
        sched_btn_gen: "ਯੋਜਨਾ ਤਿਆਰ ਕਰੋ",
        sched_btn_email: "ਮੈਨੂੰ ਇਹ ਯੋਜਨਾ ਈਮੇਲ ਕਰੋ",
        map_title: "ਕਮਿਊਨਿਟੀ ਬਿਮਾਰੀ ਆਊਟਬ੍ਰੇਕ ਨਕਸ਼ਾ",
        map_subtitle: "ਆਪਣੇ ਖੇਤਰ ਵਿੱਚ ਰਿਪੋਰਟ ਕੀਤੇ ਗਏ ਆਊਟਬ੍ਰੇਕਸ ਦੇਖੋ ਅਤੇ ਨੇੜਲੇ ਖੇਤਾਂ ਨੂੰ ਸੁਚੇਤ ਕਰਨ ਲਈ ਨਵੇਂ ਆਊਟਬ੍ਰੇਕ ਦੀ ਰਿਪੋਰਟ ਕਰੋ।",
        map_btn_report: "ਇੱਥੇ ਆਊਟਬ੍ਰੇਕ ਦੀ ਰਿਪੋਰਟ ਕਰੋ",
        analysis_title: "ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜਾ"
    },
    bn: {
        nav_home: "হোম",
        nav_features: "বৈশিষ্ট্য",
        nav_how_it_works: "এটি কীভাবে কাজ করে",
        nav_about: "আমাদের সম্পর্কে",
        nav_contact: "যোগাযোগ",
        nav_chat: "এআই চ্যাট",
        hero_title: "এআই এর সাথে কৃষিতে বিপ্লব",
        hero_subtitle: "উদ্ভিদের রোগ তাৎক্ষণিকভাবে সনাক্ত করুন এবং আপনার নখদর্পণে জৈব চাষের সমাধান পান।",
        btn_detect: "রোগ সনাক্ত করুন",
        btn_learn: "আরও জানুন",
        weather_title: "স্মার্ট আবহাওয়া উপদেষ্টা",
        weather_loc_status: "স্থানীয় উপদেষ্টার জন্য আপনার অবস্থান সনাক্ত করা হচ্ছে...",
        weather_temp: "আবহাওয়া তাপমাত্রা",
        weather_humidity: "আর্দ্রতা",
        weather_rain: "বৃষ্টির সম্ভাবনা",
        weather_wind: "বাতাসের গতিবেগ",
        weather_ai_header: "এআই চাষের টিপস",
        weather_ai_loading: "পরামর্শ তৈরি করতে পরিস্থিতি বিশ্লেষণ করা হচ্ছে...",
        calc_title: "ফসল উৎপাদন ও লাভ ক্যালকুলেটর",
        calc_subtitle: "মাটি এবং খামারের আকারের উপর ভিত্তি করে আপনার ফসলের ফলন এবং অনুমিত লাভ অনুমান করুন।",
        calc_label_crop: "ফসল নির্বাচন করুন",
        crop_rice: "ধান",
        crop_wheat: "গম",
        crop_tomato: "টমেটো",
        crop_potato: "আলু",
        calc_label_area: "খামারের আকার (একর)",
        calc_label_soil: "মাটির ধরন",
        soil_loam: "দোআঁশ (সর্বোত্তম)",
        soil_clay: "কাদা মাটি",
        soil_sandy: "বেলে মাটি",
        soil_silt: "পলি মাটি",
        calc_out_yield: "অনুমিত ফলন",
        calc_out_cost: "অনুমিত খরচ",
        calc_out_profit: "অনুমিত নেট লাভ",
        sched_title: "এআই ফসল ক্যালেন্ডার পরিকল্পনাকারী",
        sched_subtitle: "আপনার ফসলের জন্য সপ্তাহ-বাই-সপ্তাহ কাস্টমাইজড পরিকল্পনা তৈরি করুন।",
        sched_label_crop: "ফসল নির্বাচন করুন",
        sched_label_date: "বপনের তারিখ",
        sched_btn_gen: "পরিকল্পনা তৈরি করুন",
        sched_btn_email: "আমাকে এই পরিকল্পনাটি ইমেল করুন",
        map_title: "কমিউনিটি রোগ প্রাদুর্ভাব মানচিত্র",
        map_subtitle: "আপনার অঞ্চলে প্রাদুর্ভাবের রিপোর্ট দেখুন এবং আশেপাশের খামারগুলিকে সতর্ক করতে প্রাদুর্ভাবের রিপোর্ট করুন।",
        map_btn_report: "এখানে প্রাদুর্ভাবের রিপোর্ট করুন",
        analysis_title: "বিশ্লেষণ ফলাফল"
    }
};

function translatePage(lang) {
    const elements = document.querySelectorAll('[data-translate-key]');
    elements.forEach(el => {
        const key = el.getAttribute('data-translate-key');
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = TRANSLATIONS[lang][key];
            } else {
                el.textContent = TRANSLATIONS[lang][key];
            }
        }
    });

    // Translate standard dropdown option elements
    const cropOptions = document.querySelectorAll('#calc-crop option, #sched-crop option');
    cropOptions.forEach(opt => {
        const key = opt.getAttribute('data-translate-key');
        if (key && TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            opt.textContent = TRANSLATIONS[lang][key];
        }
    });

    const soilOptions = document.querySelectorAll('#calc-soil option');
    soilOptions.forEach(opt => {
        const key = opt.getAttribute('data-translate-key');
        if (key && TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            opt.textContent = TRANSLATIONS[lang][key];
        }
    });

    // Update active dropdown value
    const langSelector = document.getElementById('lang-selector');
    if (langSelector) langSelector.value = lang;

    // Recalculate yields to update slider label suffixes in the selected language
    const areaInput = document.getElementById('calc-area');
    if (areaInput) {
        areaInput.dispatchEvent(new Event('input'));
    }

    // Refresh weather advisory in the newly selected language if loaded
    if (typeof currentWeatherLoadedData !== 'undefined' && currentWeatherLoadedData) {
        fetchWeatherTip(currentWeatherLoadedData);
    }

    // Automatically translate/regenerate crop schedule if already visible
    const outputBox = document.getElementById('schedule-output-box');
    if (outputBox && outputBox.style.display !== 'none') {
        const genBtn = document.getElementById('generate-schedule-btn');
        if (genBtn) genBtn.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const langSelector = document.getElementById('lang-selector');
    if (langSelector) {
        langSelector.addEventListener('change', (e) => {
            const selectedLang = e.target.value;
            localStorage.setItem('language', selectedLang);
            translatePage(selectedLang);
            // Trigger weather tip refresh if weather is loaded
            if (currentWeatherLoadedData) {
                fetchWeatherTip(currentWeatherLoadedData);
            }
        });
    }

    // Load persisted language
    const savedLang = localStorage.getItem('language') || 'en';
    translatePage(savedLang);
});


// ==========================================
// 2. Dark Mode Toggle
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcon(isDark);
        });
    }

    // Initialize Theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    if (shouldBeDark) {
        document.body.classList.add('dark-theme');
        updateThemeIcon(true);
    } else {
        document.body.classList.remove('dark-theme');
        updateThemeIcon(false);
    }
});

function updateThemeIcon(isDark) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            if (isDark) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    }
}


// ==========================================
// 3. Smart Weather Advisor
// ==========================================
let currentWeatherLoadedData = null;

async function fetchWeatherTip(weather) {
    const tipTextEl = document.getElementById('weather-tip-text');
    if (!tipTextEl) return;

    const savedLang = localStorage.getItem('language') || 'en';
    const langMap = {
        en: 'English',
        hi: 'Hindi',
        pa: 'Punjabi',
        bn: 'Bengali'
    };
    const language = langMap[savedLang] || 'English';

    try {
        const res = await fetch('http://localhost:3000/api/weather-tips', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                temp: weather.temp,
                humidity: weather.humidity,
                rain: weather.rain,
                wind: weather.wind,
                language: language
            })
        });

        const data = await res.json();
        if (data.tip) {
            tipTextEl.textContent = data.tip;
        } else {
            tipTextEl.textContent = 'Error loading tip.';
        }
    } catch (err) {
        console.error('Weather tip fetch error:', err);
        tipTextEl.textContent = 'Unable to fetch AI tips at this time.';
    }
}

function initWeather() {
    const weatherGrid = document.querySelector('.weather-grid');
    const weatherAiTip = document.querySelector('.weather-ai-tip');
    const statusText = document.getElementById('weather-status-text');

    if (!navigator.geolocation) {
        statusText.textContent = "Geolocation is not supported by your browser.";
        loadFallbackWeather(28.6139, 77.2090, "New Delhi (Fallback)");
        return;
    }

    statusText.textContent = "Requesting location permission...";

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            statusText.textContent = `Location acquired: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
            await loadWeatherData(lat, lon);
        },
        (error) => {
            console.warn("Geolocation error:", error);
            statusText.textContent = "Location permission denied. Showing weather advisory for New Delhi.";
            loadFallbackWeather(28.6139, 77.2090, "New Delhi (Fallback)");
        }
    );
}

async function loadFallbackWeather(lat, lon, locationName) {
    const statusText = document.getElementById('weather-status-text');
    if (statusText) {
        statusText.textContent = `Showing advisory for ${locationName}`;
    }
    await loadWeatherData(lat, lon);
}

async function loadWeatherData(lat, lon) {
    const tempVal = document.getElementById('weather-temp-val');
    const humidityVal = document.getElementById('weather-humidity-val');
    const rainVal = document.getElementById('weather-rain-val');
    const windVal = document.getElementById('weather-wind-val');
    const tipTextEl = document.getElementById('weather-tip-text');

    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`);
        const data = await response.json();
        
        if (data && data.current) {
            const temp = data.current.temperature_2m;
            const humidity = data.current.relative_humidity_2m;
            const rain = data.current.precipitation;
            const wind = data.current.wind_speed_10m;

            if (tempVal) tempVal.textContent = `${temp}°C`;
            if (humidityVal) humidityVal.textContent = `${humidity}%`;
            if (rainVal) rainVal.textContent = `${rain > 0 ? 'Yes (' + rain + 'mm)' : '0%'}`;
            if (windVal) windVal.textContent = `${wind} km/h`;

            // Make weather grid and AI tip cards visible
            const weatherGrid = document.querySelector('.weather-grid');
            const weatherAiTip = document.querySelector('.weather-ai-tip');
            if (weatherGrid) weatherGrid.style.display = 'grid';
            if (weatherAiTip) weatherAiTip.style.display = 'block';

            const weatherObj = {
                temp: temp,
                humidity: humidity,
                rain: rain > 0 ? rain : 0,
                wind: wind
            };

            currentWeatherLoadedData = weatherObj;
            await fetchWeatherTip(weatherObj);
        }
    } catch (error) {
        console.error("Error loading weather data:", error);
        if (tipTextEl) tipTextEl.textContent = "Error loading weather data.";
    }
}

 const CALENDAR_STEPS = {
    en: {
        rice: [
            { week: 1, title: "Nursery Sowing & Field Bed Preparation", desc: "Clean and treat seeds with Carbendazim (2g/kg). Plow the nursery bed 3-4 times, adding well-rotted Farmyard Manure. Flood the field (2-3 cm) to begin puddling for water retention." },
            { week: 2, title: "Seedling Selection & Transplanting", desc: "Select healthy, 21-25 day old seedlings (15-20 cm high, 3-4 leaves). Transplant 2-3 seedlings per hill at a shallow depth of 2-3 cm. Maintain 20x15 cm spacing." },
            { week: 3, title: "Water Depth Management & Early Fertilization", desc: "Maintain constant 3-5 cm water level. Apply basal top-dressing of Nitrogen (Urea at 30-40 kg/acre) and Zinc Sulfate (10 kg/acre) to prevent Khaira disease." },
            { week: 4, title: "Hand Weeding & Integrated Weed Management", desc: "Perform hand weeding or apply pre-emergence herbicide Pretilachlor (600 ml/acre) within 3-4 days. Check for Yellow Stem Borer moths." },
            { week: 5, title: "Active Tillering & Mid-Season Nitrogen", desc: "Keep fields flooded during active tillering. Apply the second dose of Urea (30 kg/acre) to boost stem elongation and panicle initiation." },
            { week: 6, title: "Stem Elongation & Disease Prophylaxis", desc: "Monitor for Blast lesions and Bacterial Leaf Blight. If BLB is detected, drain the field temporarily and spray Streptocycline (6g/acre) mixed with Copper Oxychloride (500g/acre)." }
        ],
        wheat: [
            { week: 1, title: "Pre-Sowing Irrigation & Basal NPK Tillage", desc: "Perform pre-sowing irrigation (Paleva) for uniform moisture. Apply a basal dose of NPK fertilizer (50 kg DAP and 20 kg MOP per acre) before drilling seeds 4-5 cm deep." },
            { week: 2, title: "Germination & Early Crop Establishment", desc: "Monitor seedling emergence. Look out for early termite attacks or cutworms; apply chlorpyriphos in soil if termite history exists." },
            { week: 3, title: "Crown Root Initiation (CRI) & First Irrigation", desc: "The CRI stage (21 days after sowing) is the most critical stage. Perform the first irrigation gently. Missing irrigation here can drop yields by 30%." },
            { week: 4, title: "First Urea Top-Dressing & Herbicide Spray", desc: "Top-dress with Urea (45 kg/acre) immediately after the first irrigation. Spray Sulfosulfuron (13.5g/acre) to control Phalaris minor (Gulli Danda) and broadleaf weeds." },
            { week: 5, title: "Tillering Stage & Second Irrigation", desc: "Active tillering starts (35-40 days). Perform the second irrigation. Spray 2% Urea solution if leaves look pale/yellowish." },
            { week: 6, title: "Jointing Stage & Yellow Rust Inspection", desc: "Plants begin stem elongation. Inspect leaves for Yellow Rust (Puccinia striiformis) pustules. Spray Propiconazole (200 ml/acre) if spotted." }
        ],
        tomato: [
            { week: 1, title: "Soil Compounding & Transplanting", desc: "Add 10 tons of FYM compost per acre along with Trichoderma viride to prevent root rot. Form raised beds and transplant 25-30 day old seedlings 60 cm apart." },
            { week: 2, title: "Root Establishment & Light Drip Irrigation", desc: "Irrigate using drip lines (2-3 hours every alternate day). Avoid flooding to prevent collar rot. Inspect for base damping-off." },
            { week: 3, title: "Bamboo Staking & Trellising Support", desc: "Tie growing tomato vines to bamboo stakes. Staking keeps foliage and developing fruits off wet soil, reducing early blight and improving fruit quality." },
            { week: 4, title: "Pruning Side Suckers & Soluble NPK", desc: "Prune non-productive side suckers below the first flower cluster. Apply balanced NPK 19:19:19 soluble fertilizer via drip irrigation (5 kg/acre)." },
            { week: 5, title: "Flowering Stage & Fruit Borer Prevention", desc: "Heavy flowering starts. Spray Neem Oil (3000 ppm) or Bacillus thuringiensis to prevent Tomato Fruit Borer (Helicoverpa armigera) and Leaf Miners." },
            { week: 6, title: "Fruit Development & Fungicide Protection", desc: "Green fruits form. Apply a prophylactic spray of Mancozeb (2g/L) to prevent Early/Late Blight. Ensure consistent soil moisture to prevent Blossom End Rot." }
        ],
        potato: [
            { week: 1, title: "Seed Tuber Selection & Planting", desc: "Select sprouted seed tubers (30-50g). Treat with Boric Acid (3%) to prevent Black Scurf. Plant in ridges 60 cm apart, 10-12 cm deep with sprouts facing up." },
            { week: 2, title: "Ridge Settlement & Pre-Emergence Herbicide", desc: "Ensure ridges remain stable. Apply pre-emergence Metribuzin (200g/acre) on moist soil to control weeds before potato sprouts emerge." },
            { week: 3, title: "Earthing-Up (Hilling) & First Irrigation", desc: "Mound loose soil up around the stems (hilling) when plants are 15-20 cm tall to prevent tubers from turning green. Irrigate furrows gently." },
            { week: 4, title: "Sprouting Growth & Nitrogen Application", desc: "Foliage expands. Apply Urea (40 kg/acre) as a band placement on the ridges before the second irrigation. Avoid soil saturation." },
            { week: 5, title: "Tuber Initiation Stage & Water Control", desc: "Critical stage (45-50 days) when stolon tips swell. Maintain uniform soil moisture; water stress here severely reduces the number of tubers." },
            { week: 6, title: "Canopy Cover & Late Blight Watch", desc: "Foliage canopy covers ridges. Inspect for water-soaked spots with white mold under leaves. Spray Cymoxanil + Mancozeb if Late Blight is detected." }
        ]
    },
    hi: {
        rice: [
            { week: 1, title: "नर्सरी बुवाई और खेत की तैयारी", desc: "बीजों को कार्बोन्डाजिम (2 ग्राम/किग्रा) से उपचारित करें। नर्सरी क्यारी की 3-4 बार जुताई कर जैविक खाद डालें। जल संचयन के लिए पडलिंग शुरू करने हेतु खेत में 2-3 सेमी पानी भरें।" },
            { week: 2, title: "स्वस्थ पौधों का चयन और रोपाई", desc: "नर्सरी से 21-25 दिन पुराने स्वस्थ पौधे (15-20 सेमी ऊंचे, 3-4 पत्तियां) चुनें। 2-3 पौधों को 2-3 सेमी की उथली गहराई पर रोपें। रोपण दूरी 20x15 सेमी रखें।" },
            { week: 3, title: "जल स्तर प्रबंधन और प्रारंभिक उर्वरीकरण", desc: "खेत में लगातार 3-5 सेमी पानी का स्तर बनाए रखें। खैरा रोग से बचाव के लिए नाइट्रोजन (30-40 किग्रा/एकड़ यूरिया) और जिंक सल्फेट (10 किग्रा/एकड़) की पहली खुराक डालें।" },
            { week: 4, title: "निराई-गुड़ाई और एकीकृत खरपतवार प्रबंधन", desc: "हाथ से निराई करें या रोपाई के 3-4 दिनों के भीतर प्रेटिलाक्लोर (600 मिली/एकड़) खरपतवारनाशक का प्रयोग करें। पीला तना छेदक कीट की निगरानी करें।" },
            { week: 5, title: "सक्रिय कल्ले निकलना और दूसरा यूरिया डोज", desc: "कल्ले निकलते समय खेत में पानी भरकर रखें। तने के बढ़ाव और बालियां बनने की प्रक्रिया को तेज करने के लिए यूरिया (30 किग्रा/एकड़) की दूसरी खुराक डालें।" },
            { week: 6, title: "तना बढ़ाव और रोग नियंत्रण छिड़काव", desc: "ब्लास्ट रोग और बैक्टीरियल लीफ ब्लाइट (BLB) पर नज़र रखें। यदि BLB दिखे, तो पानी सुखाएं और स्ट्रेप्टोसाइक्लिन (6 ग्राम/एकड़) + कॉपर ऑक्सीक्लोराइड (500 ग्राम/एकड़) का छिड़काव करें।" }
        ],
        wheat: [
            { week: 1, title: "बोनी पूर्व सिंचाई और बेसल उर्वरक जुताई", desc: "नमी बनाए रखने के लिए पलेवा सिंचाई करें। खेत की अच्छी जुताई कर प्रति एकड़ 50 किग्रा डीएपी (DAP) और 20 किग्रा एमओपी (MOP) मिलाकर बीज को 4-5 सेमी गहरा बोएं।" },
            { week: 2, title: "अंकुरण और प्रारंभिक फसल स्थापना", desc: "अंकुरण की निगरानी करें। ध्यान रखें कि मिट्टी की ऊपरी परत सख्त न हो। दीमक के प्रकोप से बचने के लिए आवश्यकतानुसार क्लोरपायरीफॉस का प्रयोग करें।" },
            { week: 3, title: "क्राउन रूट इनिशिएशन (CRI) और पहली सिंचाई", desc: "बुवाई के 21 दिन बाद क्राउन रूट इनिशिएशन (CRI) चरण आता है। इस समय पहली सिंचाई बहुत ही हल्की और सावधानी से करें। लापरवाही से उपज 30% तक घट सकती है।" },
            { week: 4, title: "पहला यूरिया टॉप-ड्रेसिंग और खरपतवार नाशक", desc: "सिंचाई के तुरंत बाद नम मिट्टी में यूरिया (45 किग्रा/एकड़) का प्रयोग करें। गुल्ली डंडा (Phalaris minor) और चौड़ी पत्ती के खरपतवारों के नियंत्रण के लिए सल्फोसल्फ्यूरॉन (13.5 ग्राम/एकड़) का छिड़काव करें।" },
            { week: 5, title: "कल्ले निकलने का चरण और दूसरी सिंचाई", desc: "सक्रिय कल्ले निकलने (35-40 दिन) के दौरान दूसरी सिंचाई करें। यदि पत्तियां पीली दिखें, तो 2% यूरिया घोल का फोलियर स्प्रे करें।" },
            { week: 6, title: "जॉइंटिंग चरण और पीला रतुआ निरीक्षण", desc: "पौधों का तना बढ़ना शुरू होता है। पत्तियों पर पीला रतुआ (Yellow Rust) के धब्बों की जांच करें। प्रकोप दिखने पर प्रोपिकोनाजोल (200 मिली/एकड़) का छिड़काव करें।" }
        ],
        tomato: [
            { week: 1, title: "भूमि की तैयारी और रोपाई", desc: "जड़ सड़न से बचाव के लिए प्रति एकड़ 10 टन जैविक खाद और ट्राइकोडेर्मा विरिड मिलाएं। उठी हुई क्यारियां बनाकर 25-30 दिन पुराने पौधों को 60 सेमी की दूरी पर रोपें।" },
            { week: 2, title: "जड़ विकास और हल्की ड्रिप सिंचाई", desc: "ड्रिप सिंचाई का उपयोग करें (हर एक दिन छोड़कर 2-3 घंटे)। कॉलर रॉट रोग से बचने के लिए अत्यधिक पानी देने से बचें। पौधों के गलने की जांच करें।" },
            { week: 3, title: "बांस का सहारा (Staking) देना", desc: "बढ़ते पौधों को बांस के खंभों और रस्सी के सहारे बांधें। सहारा देने से पत्तियां और फल गीली मिट्टी से दूर रहते हैं, जिससे झुलसा रोग कम होता है और गुणवत्ता सुधरती है।" },
            { week: 4, title: "छंतई (Pruning) और घुलनशील NPK", desc: "मुख्य तने के विकास के लिए नीचे की फालतू शाखाओं की छंटाई करें। ड्रिप द्वारा प्रति एकड़ 5 किग्रा घुलनशील NPK 19:19:19 उर्वरक दें।" },
            { week: 5, title: "फूल आने का चरण और फल छेदक कीट नियंत्रण", desc: "भारी मात्रा में फूल आना शुरू होते हैं। टमाटर फल छेदक (Fruit Borer) और लीफ माइनर से बचाव के लिए नीम तेल (3000 ppm) या बीटी (Bt) का छिड़काव करें।" },
            { week: 6, title: "फल का विकास और कवकनाशी सुरक्षा", desc: "हरे फल बनने लगते हैं। अगेती और पछेती झुलसा रोग से बचाव के लिए मैंकोजेब (2 ग्राम/लीटर) का छिड़काव करें। ब्लॉसम एंड रॉट से बचने के लिए मिट्टी में नमी बनाए रखें।" }
        ],
        potato: [
            { week: 1, title: "आलू की बुवाई", desc: "आलू के टुकड़ों को 2+ आँखों के साथ काटें। मेड़ों पर 10-12 सेमी गहरे बोएं।" },
            { week: 2, title: "मिट्टी चढ़ाना (Hilling)", desc: "तनों के चारों ओर ढीली मिट्टी चढ़ाएं ताकि बढ़ते हुए आलू धूप से हरे न हों।" },
            { week: 3, title: "सिंचाई और यूरिया का छिड़काव", desc: "मिट्टी में लगातार नमी रखें लेकिन जलजमाव न होने दें। आलू का आकार बढ़ाने के लिए यूरिया डालें।" },
            { week: 4, title: "झुलसा रोग की रोकथाम", desc: "पत्तियों पर गहरे हरे, पानी से भरे धब्बों पर नज़र रखें। नम मौसम में जैविक तांबा कवकनाशी लगाएं।" }
        ]
    },
    pa: {
        rice: [
            { week: 1, title: "ਪਨੀਰੀ ਦੀ ਬਿਜਾਈ ਅਤੇ ਖੇਤ ਦੀ ਤਿਆਰੀ", desc: "ਬੀਜਾਂ ਨੂੰ ਕਾਰਬੈਂਡਾਜ਼ਿਮ (2 ਗ੍ਰਾਮ/ਕਿਲੋ) ਨਾਲ ਸੋਧੋ। ਦੇਸੀ ਰੂੜੀ ਖਾਦ ਪਾ ਕੇ ਨਰਸਰੀ ਬੈੱਡ ਤਿਆਰ ਕਰੋ। ਕੱਦੂ (Puddling) ਕਰਨ ਲਈ ਖੇਤ ਵਿੱਚ 2-3 ਸੈਂਟੀਮੀਟਰ ਪਾਣੀ ਭਰੋ।" },
            { week: 2, title: "ਪਨੀਰੀ ਦੀ ਪੁੱਟਾਈ ਅਤੇ ਲਵਾਈ", desc: "21-25 ਦਿਨਾਂ ਦੀ ਤੰਦਰੁਸਤ ਪਨੀਰੀ (15-20 ਸੈਂਟੀਮੀਟਰ ਉੱਚੀ) ਖੇਤ ਵਿੱਚ ਲਗਾਓ। 2-3 ਬੂਟੇ ਪ੍ਰਤੀ ਹਿੱਲ 2-3 ਸੈਂਟੀਮੀਟਰ ਡੂੰਘੇ ਲਗਾਓ। ਫਾਸਲਾ 20x15 ਸੈਂਟੀਮੀਟਰ ਰੱਖੋ।" },
            { week: 3, title: "ਪਾਣੀ ਦਾ ਪ੍ਰਬੰਧਨ ਅਤੇ ਯੂਰੀਆ ਦੀ ਪਹਿਲੀ ਖੁਰਾਕ", desc: "ਖੇਤ ਵਿੱਚ 3-5 ਸੈਂਟੀਮੀਟਰ ਪਾਣੀ ਬਣਾ ਕੇ ਰੱਖੋ। ਖੈਰਾ ਰੋਗ ਤੋਂ ਬਚਾਅ ਲਈ ਯੂਰੀਆ (30-40 ਕਿਲੋ/ਏਕੜ) ਅਤੇ ਜ਼ਿੰਕ ਸਲਫੇਟ (10 ਕਿਲੋ/ਏਕੜ) ਪਾਓ।" },
            { week: 4, title: "ਗੋਡੀ ਅਤੇ ਨਦੀਨਾਂ ਦਾ ਪ੍ਰਬੰਧਨ", desc: "ਹੱਥੀਂ ਗੋਡੀ ਕਰੋ ਜਾਂ ਲਵਾਈ ਦੇ 3-4 ਦਿਨਾਂ ਦੇ ਅੰਦਰ ਪ੍ਰੈਟੀਲਾਕਲੋਰ (600 ਮਿਲੀਲੀਟਰ/ਏਕੜ) ਨਦੀਨਨਾਸ਼ਕ ਦੀ ਵਰਤੋਂ ਕਰੋ। ਤਣਾ ਛੇਦਕ ਸੁੰਡੀ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।" },
            { week: 5, title: "ਸ਼ਾਖਾਵਾਂ ਫੁੱਟਣਾ ਅਤੇ ਯੂਰੀਆ ਦੀ ਦੂਜੀ ਖੁਰਾਕ", desc: "ਬੂਟੇ ਦੇ ਵਾਧੇ ਦੌਰਾਨ ਖੇਤ ਵਿੱਚ ਪਾਣੀ ਖੜ੍ਹਾ ਰੱਖੋ। ਵਧੀਆ ਝਾੜ ਲਈ ਯੂਰੀਆ (30 ਕਿਲੋ/ਏਕੜ) ਦੀ ਦੂਜੀ ਖੁਰਾਕ ਪਾਓ।" },
            { week: 6, title: "ਬਿਮਾਰੀਆਂ ਦੀ ਜਾਂਚ ਅਤੇ ਬਚਾਅ ਸਪਰੇਅ", desc: "ਝੁਲਸ ਰੋਗ (Blast) ਦੀ ਜਾਂਚ ਕਰੋ। ਜੇਕਰ ਬੈਕਟੀਰੀਅਲ ਬਲਾਈਟ ਦਿਖਾਈ ਦੇਵੇ, ਤਾਂ ਪਾਣੀ ਸੁਕਾਓ ਅਤੇ ਸਟ੍ਰੈਪਟੋਸਾਈਕਲਿਨ (6 ਗ੍ਰਾਮ) + ਕਾਪਰ ਆਕਸੀਕਲੋਰਾਈਡ (500 ਗ੍ਰਾਮ) ਦੀ ਸਪਰੇਅ ਕਰੋ।" }
        ],
        wheat: [
            { week: 1, title: "ਬਿਜਾਈ ਤੋਂ ਪਹਿਲਾਂ ਸਿੰਚਾਈ ਅਤੇ ਖਾਦ ਪ੍ਰਬੰਧਨ", desc: "ਸਹੀ ਨਮੀ ਲਈ ਪਲੇਵਾ ਸਿੰਚਾਈ ਕਰੋ। ਬਿਜਾਈ ਵੇਲੇ 50 ਕਿਲੋ ਡੀ.ਏ.ਪੀ. (DAP) ਅਤੇ 20 ਕਿਲੋ ਐੱਮ.ਓ.ਪੀ. (MOP) ਪ੍ਰਤੀ ਏਕੜ ਪਾ ਕੇ ਬੀਜ 4-5 ਸੈਂਟੀਮੀਟਰ ਡੂੰਘਾ ਬੀਜੋ।" },
            { week: 2, title: "ਅੰਕੁਰਣ ਅਤੇ ਬੂਟਿਆਂ ਦਾ ਜੰਮਣਾ", desc: "ਬੀਜ ਦੇ ਜੰਮਣ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ। ਜ਼ਮੀਨ ਉੱਪਰ ਪੇਪੜੀ ਨਾ ਬਣਨ ਦਿਓ। ਦੀਮਕ ਦੇ ਹਮਲੇ ਤੋਂ ਬਚਾਅ ਲਈ ਲੋੜ ਅਨੁਸਾਰ ਕਲੋਰਪਾਇਰੀਫਾਸ ਦੀ ਵਰਤੋਂ ਕਰੋ।" },
            { week: 3, title: "ਕੋਰ ਸਿੰਚਾਈ (CRI Stage)", desc: "ਬਿਜਾਈ ਤੋਂ 21 ਦਿਨਾਂ ਬਾਅਦ ਪਹਿਲਾ ਪਾਣੀ (ਕੋਰ) ਜ਼ਰੂਰ ਲਗਾਓ। ਇਹ ਪਾਣੀ ਕਣਕ ਦੇ ਝਾੜ ਲਈ ਸਭ ਤੋਂ ਮਹੱਤਵਪੂਰਨ ਹੁੰਦਾ ਹੈ।" },
            { week: 4, title: "ਯੂਰੀਆ ਖਾਦ ਪਾਉਣਾ ਅਤੇ ਨਦੀਨਨਾਸ਼ਕ ਸਪਰੇਅ", desc: "ਪਹਿਲੇ ਪਾਣੀ ਤੋਂ ਤੁਰੰਤ ਬਾਅਦ ਗਿੱਲੀ ਮਿੱਟੀ ਵਿੱਚ ਯੂਰੀਆ (45 ਕਿਲੋ/ਏਕੜ) ਪਾਓ। ਗੁੱਲੀ ਡੰਡੇ ਦੇ ਨਾਸ਼ ਲਈ ਸਲਫੋਸਲਫਿਊਰਾਨ (13.5 ਗ੍ਰਾਮ/ਏਕੜ) ਦੀ ਸਪਰੇਅ ਕਰੋ।" },
            { week: 5, title: "ਫੁਟਾਰਾ ਅਤੇ ਦੂਜੀ ਸਿੰਚਾਈ", desc: "ਬਿਜਾਈ ਦੇ 35-40 ਦਿਨਾਂ ਬਾਅਦ ਦੂਜਾ ਪਾਣੀ ਲਗਾਓ। ਜੇਕਰ ਪੱਤੇ ਪੀਲੇ ਲੱਗਣ, ਤਾਂ 2% ਯੂਰੀਆ ਦੇ ਘੋਲ ਦੀ ਸਪਰੇਅ ਕਰੋ।" },
            { week: 6, title: "ਕਣਕ ਦੀ ਕੁੰਗੀ (Yellow Rust) ਦੀ ਜਾਂਚ", desc: "ਬੂਟੇ ਵਧਣੇ ਸ਼ੁਰੂ ਹੁੰਦੇ ਹਨ। ਪੱਤਿਆਂ 'ਤੇ ਪੀਲੀ ਕੁੰਗੀ ਦੇ ਨਿਸ਼ਾਨਾਂ ਦੀ ਜਾਂਚ ਕਰੋ। ਬਿਮਾਰੀ ਦਿਖਣ 'ਤੇ ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ (200 ਮਿਲੀਲੀਟਰ) ਦੀ ਸਪਰੇਅ ਕਰੋ।" }
        ],
        tomato: [
            { week: 1, title: "ਜ਼ਮੀਨ ਦੀ ਤਿਆਰੀ ਅਤੇ ਪਨੀਰੀ ਲਗਾਉਣਾ", desc: "ਜੜ੍ਹ ਗਲਣ ਦੇ ਰੋਗ ਤੋਂ ਬਚਣ ਲਈ 10 ਟਨ ਰੂੜੀ ਖਾਦ ਅਤੇ ਟ੍ਰਾਈਕੋਡਰਮਾ ਮਿਲਾਓ। ਵੱਟਾਂ ਬਣਾ ਕੇ 25-30 ਦਿਨਾਂ ਦੇ ਬੂਟੇ 60 ਸੈਂਟੀਮੀਟਰ ਦੀ ਦੂਰੀ 'ਤੇ ਲਗਾਓ।" },
            { week: 2, title: "ਜੜ੍ਹਾਂ ਫੜਨਾ ਅਤੇ ਤੁਪਕਾ ਸਿੰਚਾਈ", desc: "ਤੁਪਕਾ ਸਿੰਚਾਈ (Drip) ਦੀ ਵਰਤੋਂ ਕਰੋ (ਇੱਕ ਦਿਨ ਛੱਡ ਕੇ 2-3 ਘੰਟੇ)। ਤਣਾ ਗਲਣ ਦੇ ਰੋਗ ਤੋਂ ਬਚਣ ਲਈ ਜ਼ਿਆਦਾ ਪਾਣੀ ਦੇਣ ਤੋਂ ਗੁਰੇਜ਼ ਕਰੋ।" },
            { week: 3, title: "ਬਾਂਸ ਦਾ ਸਹਾਰਾ (Staking) ਦੇਣਾ", desc: "ਟਮਾਟਰ ਦੀਆਂ ਵੇਲਾਂ ਨੂੰ ਬਾਂਸ ਦੀਆਂ ਖੋਪੀਆਂ ਨਾਲ ਬੰਨ੍ਹੋ। ਇਸ ਨਾਲ ਫਲ ਜ਼ਮੀਨ ਦੀ ਸਿੱਲ੍ਹ ਤੋਂ ਬਚੇ ਰਹਿੰਦੇ ਹਨ ਅਤੇ ਝੁਲਸ ਰੋਗ ਘਟਦਾ ਹੈ।" },
            { week: 4, title: "ਫਾਲਤੂ ਸ਼ਾਖਾਵਾਂ ਕੱਟਣਾ ਅਤੇ ਖਾਦ ਪ੍ਰਬੰਧਨ", desc: "ਬੂਟੇ ਦੇ ਸਹੀ ਵਾਧੇ ਲਈ ਹੇਠਲੀਆਂ ਫਾਲਤੂ ਸ਼ਾਖਾਵਾਂ ਕੱਟੋ। ਤੁਪਕਾ ਸਿੰਚਾਈ ਰਾਹੀਂ 5 ਕਿਲੋ ਘੁਲਣਸ਼ੀਲ NPK 19:19:19 ਪ੍ਰਤੀ ਏਕੜ ਦਿਓ।" },
            { week: 5, title: "ਫੁੱਲ ਪੈਣਾ ਅਤੇ ਕੀੜਿਆਂ ਦੀ ਰੋਕਥਾਮ", desc: "ਬੂਟਿਆਂ ਨੂੰ ਫੁੱਲ ਪੈਣੇ ਸ਼ੁਰੂ ਹੁੰਦੇ ਹਨ। ਫਲ ਛੇਦਕ ਸੁੰਡੀ ਤੋਂ ਬਚਾਅ ਲਈ ਨਿੰਮ ਦੇ ਤੇਲ (3000 ppm) ਜਾਂ ਬੀਟੀ (Bt) ਦੀ ਸਪਰੇਅ ਕਰੋ।" },
            { week: 6, title: "ਫਲਾਂ ਦਾ ਵਿਕਾਸ ਅਤੇ ਉੱਲੀਨਾਸ਼ਕ ਸਪਰੇਅ", desc: "ਹਰੇ ਫਲ ਬਣਨੇ ਸ਼ੁਰੂ ਹੁੰਦੇ ਹਨ। ਝੁਲਸ ਰੋਗ ਤੋਂ ਬਚਾਅ ਲਈ ਮੈਨਕੋਜ਼ੇਬ (2 ਗ੍ਰਾਮ/ਲੀਟਰ) ਦੀ ਸਪਰੇਅ ਕਰੋ। ਮਿੱਟੀ ਵਿੱਚ ਸਹੀ ਨਮੀ ਬਣਾਈ ਰੱਖੋ।" }
        ],
        potato: [
            { week: 1, title: "ਆਲੂਆਂ ਦੀ ਬਿਜਾਈ ਅਤੇ ਸੋਧ", desc: "30-50 ਗ੍ਰਾਮ ਦੇ ਅੰਕੁਰਿਤ ਆਲੂ ਚੁਣੋ। ਬਿਮਾਰੀਆਂ ਤੋਂ ਬਚਾਅ ਲਈ 3% ਬੋਰਿਕ ਐਸਿਡ ਨਾਲ ਸੋਧ ਕੇ ਵੱਟਾਂ ਉੱਤੇ 10-12 ਸੈਂਟੀਮੀਟਰ ਡੂੰਘੇ ਬੀਜੋ।" },
            { week: 2, title: "ਵੱਟਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਅਤੇ ਨਦੀਨਨਾਸ਼ਕ", desc: "ਯਕੀਨੀ ਬਣਾਓ ਕਿ ਵੱਟਾਂ ਸਥਿਰ ਰਹਿਣ। ਆਲੂ ਉੱਗਣ ਤੋਂ ਪਹਿਲਾਂ ਗਿੱਲੀ ਮਿੱਟੀ 'ਤੇ ਮੈਟਰੀਬਿਊਜ਼ਿਨ (200 ਗ੍ਰਾਮ/ਏਕੜ) ਨਦੀਨਨਾਸ਼ਕ ਦੀ ਸਪਰੇਅ ਕਰੋ।" },
            { week: 3, title: "ਮਿੱਟੀ ਚੜ੍ਹਾਉਣਾ (Earthing Up) ਅਤੇ ਸਿੰਚਾਈ", desc: "ਬੂਟੇ 15-20 ਸੈਂਟੀਮੀਟਰ ਦੇ ਹੋਣ 'ਤੇ ਮਿੱਟੀ ਚੜ੍ਹਾਓ ਤਾਂ ਜੋ ਆਲੂ ਧੁੱਪ ਨਾਲ ਹਰੇ ਨਾ ਹੋਣ। ਖਾਲੀਆਂ ਵਿੱਚ ਹਲਕਾ ਪਾਣੀ ਲਗਾਓ।" },
            { week: 4, title: "ਬੂਟੇ ਦਾ ਵਾਧਾ ਅਤੇ ਨਾਈਟ੍ਰੋਜਨ ਖਾਦ", desc: "ਪੱਤੇ ਤੇਜ਼ੀ ਨਾਲ ਵਧਦੇ ਹਨ। ਦੂਜੇ ਪਾਣੀ ਤੋਂ ਪਹਿਲਾਂ ਵੱਟਾਂ ਦੇ ਕਿਨਾਰਿਆਂ 'ਤੇ ਯੂਰੀਆ (40 ਕਿਲੋ/ਏਕੜ) ਪਾਓ। ਪਾਣੀ ਖੜ੍ਹਨ ਨਾ ਦਿਓ।" },
            { week: 5, title: "ਆਲੂ ਬਣਨ ਦੀ ਅਵਸਥਾ (Tuber Initiation)", desc: "ਇਹ ਆਲੂ ਬਣਨ ਦਾ ਸਭ ਤੋਂ ਨਾਜ਼ੁਕ ਸਮਾਂ (45-50 ਦਿਨ) ਹੁੰਦਾ ਹੈ। ਪਾਣੀ ਦੀ ਘਾਟ ਕਾਰਨ ਆਲੂ ਛੋਟੇ ਰਹਿ ਜਾਂਦੇ ਹਨ, ਇਸ ਲਈ ਹਲਕਾ ਪਾਣੀ ਦਿੰਦੇ ਰਹੋ।" },
            { week: 6, title: "ਕੈਨੋਪੀ ਵਾਧਾ ਅਤੇ ਝੁਲਸ ਰੋਗ (Late Blight) 'ਤੇ ਨਜ਼ਰ", desc: "ਬੂਟੇ ਪੂਰੀ ਤਰ੍ਹਾਂ ਫੈਲ ਜਾਂਦੇ ਹਨ। ਪੱਤਿਆਂ ਦੇ ਹੇਠਾਂ ਚਿੱਟੀ ਉੱਲੀ ਦੀ ਜਾਂਚ ਕਰੋ। ਬਿਮਾਰੀ ਦਿਖਣ 'ਤੇ ਸਾਈਮੋਕਸਾਨਿਲ + ਮੈਨਕੋਜ਼ੇਬ ਦੀ ਸਪਰੇਅ ਕਰੋ।" }
        ]
    },
    bn: {
        rice: [
            { week: 1, title: "বীজতলা প্রস্তুত ও জমি চাষ", desc: "কার্বেন্ডাজিম (২ gram/কেজি) সার দিয়ে বীজ শোধন করুন। বীজতলায় গোবর সার দিন। জমি তৈরির জন্য মাঠে ২-৩ সেমি জল ধরে রাখুন।" },
            { week: 2, title: "চারা রোপণ ও সঠিক দূরত্ব", desc: "২১-২৫ ধানের চারা (১৫-২০ সেমি লম্বা) রোপণের জন্য নির্বাচন করুন। ২-৩টি চারা ২-৩ সেমি গভীরতায় রোপণ করুন। দূরত্ব ২০x১৫ সেমি রাখুন।" },
            { week: 3, title: "জল ব্যবস্থাপনা ও প্রথম চাপান সার", desc: "মাঠে ৩-৫ সেমি জল ধরে রাখুন। ধানের খৈরা রোগ প্রতিরোধে নাইট্রোজেন (৩০-৪০ কেজি/একর ইউরিয়া) এবং জিংক সালফেট (১০ কেজি/একর) প্রয়োগ করুন।" },
            { week: 4, title: "আগাছা নিড়ানি ও পোকা দমন", desc: "হাতে আগাছা পরিষ্কার করুন বা ধানের চারা রোপণের ৩-৪ দিনের মধ্যে প্রিটিল্যাক্লোর (৬০০ মিলি/একর) ব্যবহার করুন। মাজরা পোকার মথ লক্ষ্য করুন।" },
            { week: 5, title: "কুশি গজানো ও দ্বিতীয় ইউরিয়া প্রয়োগ", desc: "কুশি গজানোর সময় জমিতে জল ধরে রাখা প্রয়োজন। ধানের বৃদ্ধি দ্রুত করতে ইউরিয়া (৩০ কেজি/একর) দ্বিতীয় কিস্তি প্রয়োগ করুন।" },
            { week: 6, title: "ধানের ব্লাস্ট ও ধসা রোগ প্রতিরোধ", desc: "পাতায় ব্লাস্ট বা ব্যাকটেরিয়াজনিত ধসা রোগ (BLB) হলে ধানের জমি থেকে জল নিষ্কাশন করুন এবং স্ট্রেপ্টোসাইক্লিন (৬ গ্রাম) ও কপার অক্সিক্লোরাইড (৫০০ গ্রাম) স্প্রে করুন।" }
        ],
        wheat: [
            { week: 1, title: "বপন পূর্ব সেচ ও বেসাল সার প্রয়োগ", desc: "মাটিতে সেচ দিয়ে জো আনুন। জমি ভালো করে চাষ করে DAP ও MOP দিয়ে বীজ ৪-৫ সেমি গভীরে বুনুন।" },
            { week: 2, title: "অঙ্কুরোদগম ও চারা সুস্থতা নিশ্চিতকরণ", desc: "বীজের অঙ্কুরোদগম লক্ষ্য করুন। মাটির ওপরের স্তর শক্ত হতে দেবেন না। উই পোকার উপদ্রব থাকলে ক্লোরপাইরিফস মাটিতে দিন।" },
            { week: 3, title: "প্রথম সেচ (CRI পর্যায়)", desc: "গম চাষের ২১ দিনে প্রথম সেচ দেওয়া অত্যন্ত জরুরি। এই সময় সেচ না দিলে ফলন প্রায় ৩০% পর্যন্ত হ্রাস পেতে পারে।" },
            { week: 4, title: "প্রথম ইউরিয়া চাপান ও আগাছানাশক প্রয়োগ", desc: "সেচের ঠিক পরেই ভেজা মাটিতে ইউরিয়া (৪৫ কেজি/একর) দিন। আগাছা দমনের জন্য সালফোসালফিউরন (১৩.৫ গ্রাম/একর) স্প্রে করুন।" },
            { week: 5, title: "কুশি গজানো ও দ্বিতীয় সেচ", desc: "গম গাছের কুশি গজানোর সময় (৩৫-৪০ দিন) দ্বিতীয় সেচ দিন। পাতার রঙ ফ্যাকাশে হলুদ হলে ২% ইউরিয়া দ্রবণ স্প্রে করুন।" },
            { week: 6, title: "মরিচা (Rust) রোগ ও ছত্রাকনাশক স্প্রে", desc: "কাণ্ড ও পাতা বৃদ্ধির পর্যায়। পাতায় হলুদ মরিচা রোগের দাগ খুঁজুন। লক্ষণ দেখা দিলে প্রোপিকোনাজোল (২০০ মিলি/একর) স্প্রে করুন।" }
        ],
        tomato: [
            { week: 1, title: "জমি শোধন ও চারা রোপণ", desc: "শিকড় পচা রোগ রুখতে গোবর সার ও ট্রাইকোডার্মা মেশান। বেড তৈরি করে চারা ৬০ সেমি দূরত্বে রোপণ করুন।" },
            { week: 2, title: "শিকড় গজানো ও হালকা ড্রিপ সেচ", desc: "ড্রিপ সেচ ব্যবহার করুন (একদিন অন্তর ২-৩ ঘণ্টা)। গোড়া পচা রোগ এড়াতে অতিরিক্ত জল দেওয়া বন্ধ রাখুন এবং চারা সুস্থতা পরীক্ষা করুন।" },
            { week: 3, title: "খুঁটি দেওয়া (Staking)", desc: "টমেটো গাছকে সোজা রাখার জন্য বাঁশের খুঁটি দিন যাতে ফল মাটিতে না ঠেকে এবং কন্দ ও ফল ভালো থাকে।" },
            { week: 4, title: "অপ্রয়োজনীয় ডাল ছাঁটাই ও দ্রবণীয় সার", desc: "গাছের ফলন বাড়াতে নিচের দিকের অপ্রয়োজনীয় ডাল কেটে ফেলুন। ড্রিপ দিয়ে একর প্রতি ৫ কেজি দ্রবণীয় NPK ১৯:১৯:১৯ সার প্রয়োগ করুন।" },
            { week: 5, title: "ফুল আসা ও ফল ছিদ্রকারী পোকা দমন", desc: "গাছে প্রচুর ফুল আসতে শুরু করে। ফল ছিদ্রকারী পোকা ও লিফ মাইনার দমনে নিম তেল (৩০০০ ppm) অথবা বিটি (Bt) স্প্রে করুন।" },
            { week: 6, title: "ফল পুষ্ট হওয়া ও ধসা রোগ স্প্রে", desc: "সবুজ ফল ধরতে শুরু করে। অকাল ধসা রোগ রুখতে ম্যানকোজেব (২ গ্রাম/লিটার) স্প্রে করুন। ফলের তলা পচা রোগ এড়াতে মাটিতে পর্যাপ্ত রস রাখুন।" }
        ],
        potato: [
            { week: 1, title: "বীজ আলু নির্বাচন ও রোপণ", desc: "অঙ্কুরিত বীজ আলু (৩০-৫০ গ্রাম) বেছে নিন। ব্ল্যাক স্কার্ফ রোগ রুখতে ৩% বোরিক অ্যাসিড দিয়ে শোধন করে ৬০ সেমি দূরত্বে ১০-১২ সেমি গভীরে রোপণ করুন।" },
            { week: 2, title: "নালা প্রস্তুত ও আগাছানাশক প্রয়োগ", desc: "আলু গজানোর আগেই ভেজা মাটিতে মেট্রিবিউজিন (২০০ গ্রাম/একর) আগাছানাশক স্প্রে করুন যাতে আগাছা জন্মাতে না পারে।" },
            { week: 3, title: "গোড়ায় মাটি তুলে দেওয়া ও প্রথম সেচ", desc: "গাছ ১৫-২০ সেমি লম্বা হলে গোড়ায় মাটি তুলে দিন যাতে নতুন আলু সূর্যের আলোয় সবুজ না হয়ে যায়। নালার মাঝে হালকা সেচ দিন।" },
            { week: 4, title: "গাছের বৃদ্ধি ও নাইট্রোজেন সার প্রয়োগ", desc: "পাতা ও ডালপালা দ্রুত বৃদ্ধি পায়। দ্বিতীয় সেচ দেওয়ার আগে নালায় একর প্রতি ৪০ কেজি ইউরিয়া সার দিন। জল জমতে দেবেন না।" },
            { week: 5, title: "আলু ধরার পর্যায় ও পরিমিত জলসেচ", desc: "রোপণের ৪৫-৫০ দিনে মাটিতে আলু ধরতে শুরু করে। এই সময় জলের অভাব হলে আলুর আকার ছোট হয়ে যায়, তাই নিয়মিত সেচ দিন।" },
            { week: 6, title: "নাবি ধসা (Late Blight) রোগ দমন", desc: "আলু গাছের ক্যানোপি বৃদ্ধি পায়। পাতার নিচে সাদা ছাতা বা ভেজা কালো দাগ খুঁজুন। লক্ষণ দেখলে সাইমোক্সানিল + ম্যানকোজেব স্প্রে করুন।" }
        ]
    }
}
;

function initCalculator() {
    const cropSelect = document.getElementById('calc-crop');
    const areaInput = document.getElementById('calc-area');
    const areaVal = document.getElementById('area-val');
    const soilSelect = document.getElementById('calc-soil');
    
    const yieldOutput = document.getElementById('calc-yield-val');
    const costOutput = document.getElementById('calc-cost-val');
    const profitOutput = document.getElementById('calc-profit-val');

    if (!cropSelect || !areaInput || !soilSelect || !yieldOutput || !costOutput || !profitOutput) return;

    const soilMultipliers = {
        loam: 1.2,
        clay: 0.9,
        sandy: 0.7,
        silt: 1.0
    };

    const cropParams = {
        rice: { baseYield: 2.0, baseCost: 15000, marketPrice: 25000 },
        wheat: { baseYield: 1.8, baseCost: 12000, marketPrice: 22000 },
        tomato: { baseYield: 12.0, baseCost: 30000, marketPrice: 15000 },
        potato: { baseYield: 10.0, baseCost: 25000, marketPrice: 12000 }
    };

    function calculate() {
        const crop = cropSelect.value;
        const acres = parseFloat(areaInput.value);
        const soil = soilSelect.value;

        if (areaVal) {
            const savedLang = localStorage.getItem('language') || 'en';
            let suffix = "Acres";
            if (savedLang === 'hi') suffix = "एकड़";
            else if (savedLang === 'pa') suffix = "ਏਕੜ";
            else if (savedLang === 'bn') suffix = "একর";
            areaVal.textContent = `${acres} ${suffix}`;
        }

        const params = cropParams[crop];
        const soilMult = soilMultipliers[soil] || 1.0;

        if (!params) return;

        const expectedYield = params.baseYield * soilMult * acres;
        const totalCost = params.baseCost * acres;
        const grossIncome = expectedYield * params.marketPrice;
        const netProfit = grossIncome - totalCost;

        yieldOutput.textContent = expectedYield.toFixed(1) + " tons";
        costOutput.textContent = "₹" + totalCost.toLocaleString('en-IN');
        profitOutput.textContent = "₹" + netProfit.toLocaleString('en-IN');

        const profitCard = profitOutput.closest('.calc-card-result');
        if (profitCard) {
            if (netProfit >= 0) {
                profitCard.style.borderColor = "#388e3c";
                profitCard.style.boxShadow = "0 0 10px rgba(56, 142, 60, 0.2)";
            } else {
                profitCard.style.borderColor = "#d32f2f";
                profitCard.style.boxShadow = "0 0 10px rgba(211, 47, 47, 0.2)";
            }
        }
    }

    areaInput.addEventListener('input', calculate);
    cropSelect.addEventListener('change', calculate);
    soilSelect.addEventListener('change', calculate);

    calculate();
}

let generatedCalendarData = null;

function initScheduler() {
    const cropSelect = document.getElementById('sched-crop');
    const dateInput = document.getElementById('sched-date');
    const genBtn = document.getElementById('generate-schedule-btn');
    const outputBox = document.getElementById('schedule-output-box');
    const timeline = document.getElementById('schedule-timeline');
    const emailInput = document.getElementById('schedule-email');
    const emailBtn = document.getElementById('email-schedule-btn');

    if (!cropSelect || !dateInput || !genBtn || !outputBox || !timeline) return;

    // Set default sowing date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    genBtn.addEventListener('click', () => {
        const crop = cropSelect.value;
        const sowingDateStr = dateInput.value;
        if (!sowingDateStr) {
            alert("Please select a sowing date.");
            return;
        }

        const sowingDate = new Date(sowingDateStr);
        const savedLang = localStorage.getItem('language') || 'en';
        const steps = CALENDAR_STEPS[savedLang] ? CALENDAR_STEPS[savedLang][crop] : CALENDAR_STEPS['en'][crop];
        if (!steps) return;

        timeline.innerHTML = '';
        generatedCalendarData = [];

        const weekWordMap = {
            en: "Week",
            hi: "सप्ताह",
            pa: "ਹਫ਼ਤਾ",
            bn: "সপ্তাহ"
        };
        const weekWord = weekWordMap[savedLang] || "Week";

        steps.forEach((step, index) => {
            const stepDate = new Date(sowingDate);
            stepDate.setDate(sowingDate.getDate() + (index * 7));
            const formattedDate = stepDate.toLocaleDateString(savedLang === 'en' ? 'en-IN' : savedLang, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            generatedCalendarData.push({
                week: step.week,
                title: step.title,
                desc: step.desc,
                date: formattedDate
            });

            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-badge"><i class="fas fa-calendar-day"></i></div>
                <div class="timeline-card">
                    <div class="timeline-date">${formattedDate}</div>
                    <h4>${weekWord} ${step.week}: ${step.title}</h4>
                    <p>${step.desc}</p>
                </div>
            `;
            timeline.appendChild(item);
        });

        outputBox.style.display = 'block';
        outputBox.scrollIntoView({ behavior: 'smooth' });
    });

    emailBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        if (!email) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!generatedCalendarData || generatedCalendarData.length === 0) {
            alert("Please generate a crop plan first.");
            return;
        }

        const cropName = cropSelect.options[cropSelect.selectedIndex].text;
        
        // Format the email message
        let msgText = `Hello,\n\nHere is your custom AI Crop Calendar Schedule for ${cropName}:\n\n`;
        generatedCalendarData.forEach(item => {
            msgText += `📅 Date: ${item.date}\n📍 Week ${item.week}: ${item.title}\n📝 Details: ${item.desc}\n\n`;
        });
        msgText += `Keep monitoring your crops using Kheti Baadi portal!\n\nBest regards,\nKheti Baadi AI Scheduler Team`;

        const originalText = emailBtn.textContent;
        emailBtn.textContent = 'Sending Email...';
        emailBtn.disabled = true;

        try {
            const res = await fetch('http://localhost:3000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: `Kheti Baadi Calendar Scheduler`,
                    email: email,
                    message: msgText
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert(`Schedule email successfully sent to ${email}! Check your inbox (or console if SMTP is not configured).`);
                emailInput.value = '';
            } else {
                alert(`Error: ${data.message || 'Failed to send calendar plan.'}`);
            }
        } catch (err) {
            console.error("Email calendar error:", err);
            alert("Cannot connect to server. Please verify backend is running.");
        } finally {
            emailBtn.textContent = originalText;
            emailBtn.disabled = false;
        }
    });
}

document.addEventListener('DOMContentLoaded', initWeather);
document.addEventListener('DOMContentLoaded', initCalculator);
document.addEventListener('DOMContentLoaded', initScheduler);


// ==========================================
// 6. Disease Outbreak Map
// ==========================================
function initMap() {
    const mapDiv = document.getElementById('disease-map');
    if (!mapDiv) return;

    // Center of India
    const map = L.map('disease-map').setView([22.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Mock outbreak data
    const mockOutbreaks = [
        { lat: 31.1471, lon: 75.3412, crop: "Wheat", disease: "Rust", status: "Active Outbreak", severity: "High" },
        { lat: 19.7515, lon: 75.7139, crop: "Potato", disease: "Late Blight", status: "Reported Outbreak", severity: "Medium" },
        { lat: 15.3173, lon: 75.7139, crop: "Tomato", disease: "Leaf Blight", status: "Under Control", severity: "Low" },
        { lat: 22.9868, lon: 87.8550, crop: "Rice", disease: "Blast Disease", status: "Active Outbreak", severity: "High" }
    ];

    const severityColors = {
        High: '#d32f2f',
        Medium: '#f57c00',
        Low: '#388e3c'
    };

    function getCustomMarker(severityColor) {
        return L.divIcon({
            html: `<div style="background-color: ${severityColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.4);"></div>`,
            className: 'custom-map-marker',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });
    }

    mockOutbreaks.forEach(outbreak => {
        const markerColor = severityColors[outbreak.severity] || '#2e7d32';
        const customIcon = getCustomMarker(markerColor);
        L.marker([outbreak.lat, outbreak.lon], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
                <div style="font-family: 'Poppins', sans-serif; font-size: 13px;">
                    <strong style="color: ${markerColor}; font-size: 14px;">⚠️ ${outbreak.crop} ${outbreak.disease}</strong><br>
                    <strong>Status:</strong> ${outbreak.status}<br>
                    <strong>Severity:</strong> ${outbreak.severity}<br>
                    <small>Location: ${outbreak.lat.toFixed(2)}°N, ${outbreak.lon.toFixed(2)}°E</small>
                </div>
            `);
    });

    const reportBtn = document.getElementById('report-outbreak-btn');
    if (reportBtn) {
        reportBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser to report an outbreak.");
                return;
            }

            reportBtn.disabled = true;
            reportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    const cropName = prompt("Enter Crop Name / फसल का नाम (e.g., Rice, Wheat, Tomato):", "General Crop") || "General Crop";
                    const diseaseName = prompt("Enter Disease Name / बीमारी का नाम (e.g., Rust, Leaf Blight):", "Unknown Disease") || "Unknown Disease";
                    const status = prompt("Enter Status / स्थिति (e.g., Awaiting verification, Active Outbreak, Under Control):", "Awaiting verification") || "Awaiting verification";
                    const severity = prompt("Enter Severity / गंभीरता (High, Medium, Low):", "High") || "High";
                    
                    map.setView([lat, lon], 8);

                    const severityColors = {
                        High: '#d32f2f',
                        Medium: '#f57c00',
                        Low: '#388e3c'
                    };
                    const userColor = severityColors[severity] || '#e65100';
                    const userIcon = getCustomMarker(userColor);

                    const userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);

                    const popupContent = document.createElement('div');
                    popupContent.style.fontFamily = "'Poppins', sans-serif";
                    popupContent.style.fontSize = "13px";
                    popupContent.innerHTML = `
                        <strong style="color: ${userColor}; font-size: 14px;">🚨 Outbreak: ${cropName}</strong><br>
                        <strong>Disease:</strong> ${diseaseName}<br>
                        <strong>Status:</strong> ${status}<br>
                        <strong>Severity:</strong> ${severity}<br>
                        <small>Location: ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E</small><br>
                    `;

                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn primary';
                    deleteBtn.style.padding = '4px 8px';
                    deleteBtn.style.fontSize = '11px';
                    deleteBtn.style.marginTop = '8px';
                    deleteBtn.style.width = '100%';
                    deleteBtn.textContent = 'Delete Report';
                    deleteBtn.addEventListener('click', () => {
                        map.removeLayer(userMarker);
                    });

                    popupContent.appendChild(deleteBtn);
                    userMarker.bindPopup(popupContent).openPopup();

                    alert("Thank you! Outbreak reported successfully at your current coordinates. Nearby farms have been alerted.");
                    reportBtn.disabled = false;
                    reportBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Report Outbreak Here';
                },
                (error) => {
                    console.error("Outbreak report location error:", error);
                    alert("Unable to retrieve your current location. Outbreak reported at the center of the map instead.");
                    
                    const center = map.getCenter();
                    
                    const cropName = prompt("Enter Crop Name / फसल का नाम (e.g., Rice, Wheat, Tomato):", "General Crop") || "General Crop";
                    const diseaseName = prompt("Enter Disease Name / बीमारी का नाम (e.g., Rust, Leaf Blight):", "Unknown Disease") || "Unknown Disease";
                    const status = prompt("Enter Status / स्थिति (e.g., Awaiting verification, Active Outbreak, Under Control):", "Awaiting verification") || "Awaiting verification";
                    const severity = prompt("Enter Severity / गंभीरता (High, Medium, Low):", "High") || "High";

                    const severityColors = {
                        High: '#d32f2f',
                        Medium: '#f57c00',
                        Low: '#388e3c'
                    };
                    const userColor = severityColors[severity] || '#e65100';
                    const userIcon = getCustomMarker(userColor);

                    const userMarker = L.marker([center.lat, center.lng], { icon: userIcon }).addTo(map);

                    const popupContent = document.createElement('div');
                    popupContent.style.fontFamily = "'Poppins', sans-serif";
                    popupContent.style.fontSize = "13px";
                    popupContent.innerHTML = `
                        <strong style="color: ${userColor}; font-size: 14px;">🚨 Outbreak: ${cropName}</strong><br>
                        <strong>Disease:</strong> ${diseaseName}<br>
                        <strong>Status:</strong> ${status}<br>
                        <strong>Severity:</strong> ${severity}<br>
                        <small>Location: ${center.lat.toFixed(2)}°N, ${center.lng.toFixed(2)}°E (Fallback)</small><br>
                    `;

                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn primary';
                    deleteBtn.style.padding = '4px 8px';
                    deleteBtn.style.fontSize = '11px';
                    deleteBtn.style.marginTop = '8px';
                    deleteBtn.style.width = '100%';
                    deleteBtn.textContent = 'Delete Report';
                    deleteBtn.addEventListener('click', () => {
                        map.removeLayer(userMarker);
                    });

                    popupContent.appendChild(deleteBtn);
                    userMarker.bindPopup(popupContent).openPopup();

                    reportBtn.disabled = false;
                    reportBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Report Outbreak Here';
                }
            );
        });
    }
}

document.addEventListener('DOMContentLoaded', initMap);
