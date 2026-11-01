import type { LanguageCode } from "../constants/translations";
import { searchCategoryTranslations } from "../constants/searchCategoryTranslations";
import { catalogServiceTranslations } from "./catalogServiceTranslations";
import { services } from "./services";

export type LocalizedServiceContent = {
  name: string;
  category: string;
  description: string;
  eligibility: string;
  documents: string;
};

type ServiceTranslations = Partial<
  Record<string, Partial<LocalizedServiceContent>>
>;

const officialServiceNames: Record<string, string> = {
  cpgrams: "CPGRAMS",
  digilocker: "DigiLocker",
  enam: "e-NAM",
  mygov: "MyGov India",
  umang: "UMANG",
};

export const serviceTranslations: Partial<
  Record<LanguageCode, ServiceTranslations>
> = {
  en: {},

  hi: {
    "aadhaar-update": {
      name: "आधार सेवाएँ",
      category: "पहचान",
      description: "आधार नामांकन, अपडेट, स्थिति की जाँच और संबंधित सेवाओं की आधिकारिक जानकारी प्राप्त करें।",
      eligibility: "भारत के निवासी अपनी आवश्यकता के अनुसार UIDAI की आधिकारिक सेवाओं का उपयोग कर सकते हैं।",
      documents: "दस्तावेज़ों की आवश्यकताएँ सेवा के अनुसार अलग-अलग होती हैं। केंद्र जाने या अनुरोध जमा करने से पहले UIDAI की वेबसाइट देखें।",
    },
    "pan-card": {
      name: "पैन कार्ड आवेदन",
      category: "पहचान",
      description: "आयकर विभाग के माध्यम से स्थायी खाता संख्या (PAN) के लिए आवेदन करने या विवरण अपडेट करने की जानकारी प्राप्त करें।",
      eligibility: "PAN की आवश्यकता वाले व्यक्ति और संस्थाएँ आधिकारिक आवेदन विकल्प देख सकते हैं।",
      documents: "पहचान, पते और जन्मतिथि के प्रमाण की आवश्यकताएँ आवेदक और आवेदन के तरीके पर निर्भर करती हैं।",
    },
    "pm-kisan": {
      name: "पीएम-किसान",
      category: "किसान सहायता",
      description: "योजना की जानकारी, पंजीकरण मार्गदर्शन और लाभार्थी सेवाओं के लिए आधिकारिक PM-KISAN पोर्टल देखें।",
      eligibility: "पात्रता वर्तमान PM-KISAN दिशानिर्देशों और आधिकारिक पोर्टल पर दी गई अपवर्जन शर्तों के अनुसार निर्धारित होती है।",
      documents: "आधिकारिक पोर्टल पर माँगी गई जानकारी तैयार रखें। आवश्यकताएँ मामले के अनुसार बदल सकती हैं।",
    },
    "national-scholarship": {
      name: "राष्ट्रीय छात्रवृत्ति पोर्टल",
      category: "शिक्षा",
      description: "भारत सरकार के छात्रवृत्ति पोर्टल पर आवेदन और आवेदन की स्थिति से संबंधित सेवाएँ देखें।",
      eligibility: "प्रत्येक छात्रवृत्ति की पात्रता, संस्थान, आय और शैक्षणिक आवश्यकताएँ अलग-अलग होती हैं।",
      documents: "आवेदन करने से पहले संबंधित छात्रवृत्ति के आवेदन में दी गई दस्तावेज़ों की सूची जाँचें।",
    },
  },
  as: {
    "aadhaar-update": {
      name: "আধাৰ সেৱা",
      description: "আধাৰ নামভৰ্তি, আপডেট, স্থিতি পৰীক্ষা আৰু আনুষংগিক সেৱাৰ চৰকাৰী তথ্য বিচাৰক।",
    },
    "pan-card": {
      name: "পেন কাৰ্ডৰ আবেদন",
      description: "আয়কৰ বিভাগৰ জৰিয়তে স্থায়ী একাউণ্ট নম্বৰ (PAN)ৰ বাবে আবেদন বা তথ্য আপডেট কৰাৰ উপায় জানক।",
    },
    "pm-kisan": {
      name: "পি এম-কিষাণ",
      description: "আঁচনিৰ তথ্য, পঞ্জীয়নৰ নিৰ্দেশনা আৰু হিতাধিকাৰী সেৱাৰ বাবে চৰকাৰী পি এম-কিষাণ প’ৰ্টেল চাওক।",
    },
  },
  bn: {
    "aadhaar-update": {
      name: "আধার পরিষেবা",
      description: "আধার নথিভুক্তি, হালনাগাদ, স্থিতি যাচাই এবং সংশ্লিষ্ট পরিষেবার সরকারি তথ্য জানুন।",
    },
    "pan-card": {
      name: "প্যান কার্ডের আবেদন",
      description: "আয়কর বিভাগের মাধ্যমে স্থায়ী অ্যাকাউন্ট নম্বরের (PAN) জন্য আবেদন বা তথ্য হালনাগাদ করার উপায় জানুন।",
    },
    "pm-kisan": {
      name: "পিএম-কিষান",
      description: "প্রকল্পের তথ্য, নিবন্ধনের নির্দেশনা এবং সুবিধাভোগী পরিষেবার জন্য সরকারি পিএম-কিষান পোর্টাল দেখুন।",
    },
  },
  gu: {
    "aadhaar-update": {
      name: "આધાર સેવાઓ",
      description: "આધાર નોંધણી, અપડેટ, સ્થિતિની તપાસ અને સંબંધિત સેવાઓ માટેની સત્તાવાર માહિતી મેળવો.",
    },
    "pan-card": {
      name: "પાન કાર્ડ માટે અરજી",
      description: "આવકવેરા વિભાગ દ્વારા કાયમી એકાઉન્ટ નંબર (PAN) માટે અરજી કરવા અથવા વિગતો અપડેટ કરવા વિશે જાણો.",
    },
    "pm-kisan": {
      name: "પીએમ-કિસાન",
      description: "યોજનાની માહિતી, નોંધણી માર્ગદર્શન અને લાભાર્થી સેવાઓ માટે સત્તાવાર પીએમ-કિસાન પોર્ટલ જુઓ.",
    },
  },
  kn: {
    "aadhaar-update": {
      name: "ಆಧಾರ್ ಸೇವೆಗಳು",
      description: "ಆಧಾರ್ ನೋಂದಣಿ, ನವೀಕರಣ, ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ ಮತ್ತು ಸಂಬಂಧಿತ ಸೇವೆಗಳ ಅಧಿಕೃತ ಮಾಹಿತಿಯನ್ನು ಪಡೆಯಿರಿ.",
    },
    "pan-card": {
      name: "ಪ್ಯಾನ್ ಕಾರ್ಡ್ ಅರ್ಜಿ",
      description: "ಆದಾಯ ತೆರಿಗೆ ಇಲಾಖೆಯ ಮೂಲಕ ಶಾಶ್ವತ ಖಾತೆ ಸಂಖ್ಯೆ (PAN)ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಅಥವಾ ವಿವರಗಳನ್ನು ನವೀಕರಿಸುವ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.",
    },
    "pm-kisan": {
      name: "ಪಿಎಂ-ಕಿಸಾನ್",
      description: "ಯೋಜನೆಯ ಮಾಹಿತಿ, ನೋಂದಣಿ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಫಲಾನುಭವಿ ಸೇವೆಗಳಿಗಾಗಿ ಅಧಿಕೃತ ಪಿಎಂ-ಕಿಸಾನ್ ಪೋರ್ಟಲ್ ನೋಡಿ.",
    },
  },
  ml: {
    "aadhaar-update": {
      name: "ആധാർ സേവനങ്ങൾ",
      description: "ആധാർ എൻറോൾമെന്റ്, പുതുക്കൽ, നില പരിശോധിക്കൽ, അനുബന്ധ സേവനങ്ങൾ എന്നിവയുടെ ഔദ്യോഗിക വിവരങ്ങൾ നേടുക.",
    },
    "pan-card": {
      name: "പാൻ കാർഡ് അപേക്ഷ",
      description: "ആദായനികുതി വകുപ്പിലൂടെ സ്ഥിരം അക്കൗണ്ട് നമ്പറിന് (PAN) അപേക്ഷിക്കാനോ വിവരങ്ങൾ പുതുക്കാനോ ഉള്ള മാർഗം അറിയുക.",
    },
    "pm-kisan": {
      name: "പി.എം-കിസാൻ",
      description: "പദ്ധതി വിവരങ്ങൾ, രജിസ്ട്രേഷൻ മാർഗനിർദേശം, ഗുണഭോക്തൃ സേവനങ്ങൾ എന്നിവയ്ക്ക് ഔദ്യോഗിക പി.എം-കിസാൻ പോർട്ടൽ കാണുക.",
    },
  },
  mr: {
    "aadhaar-update": {
      name: "आधार सेवा",
      description: "आधार नोंदणी, अद्ययावत करणे, स्थिती तपासणे आणि संबंधित सेवांची अधिकृत माहिती मिळवा.",
    },
    "pan-card": {
      name: "पॅन कार्ड अर्ज",
      description: "आयकर विभागामार्फत कायम खाते क्रमांकासाठी (PAN) अर्ज करणे किंवा तपशील अद्ययावत करण्याची माहिती मिळवा.",
    },
    "pm-kisan": {
      name: "पीएम-किसान",
      description: "योजनेची माहिती, नोंदणी मार्गदर्शन आणि लाभार्थी सेवांसाठी अधिकृत पीएम-किसान पोर्टल पाहा.",
    },
  },
  ne: {
    "aadhaar-update": {
      name: "आधार सेवाहरू",
      description: "आधार दर्ता, अद्यावधिक, स्थिति जाँच र सम्बन्धित सेवाका आधिकारिक जानकारी पाउनुहोस्।",
    },
    "pan-card": {
      name: "प्यान कार्ड आवेदन",
      description: "आयकर विभागमार्फत स्थायी खाता नम्बर (PAN) का लागि आवेदन दिने वा विवरण अद्यावधिक गर्ने जानकारी पाउनुहोस्।",
    },
    "pm-kisan": {
      name: "पीएम-किसान",
      description: "योजनाको जानकारी, दर्ता मार्गदर्शन र लाभग्राही सेवाका लागि आधिकारिक पीएम-किसान पोर्टल हेर्नुहोस्।",
    },
  },
  or: {
    "aadhaar-update": {
      name: "ଆଧାର ସେବା",
      description: "ଆଧାର ନାମଲେଖା, ଅଦ୍ୟତନ, ସ୍ଥିତି ଯାଞ୍ଚ ଏବଂ ସମ୍ପୃକ୍ତ ସେବାର ସରକାରୀ ସୂଚନା ପାଆନ୍ତୁ।",
    },
    "pan-card": {
      name: "ପାନ୍ କାର୍ଡ ଆବେଦନ",
      description: "ଆୟକର ବିଭାଗ ମାଧ୍ୟମରେ ସ୍ଥାୟୀ ଖାତା ନମ୍ବର (PAN) ପାଇଁ ଆବେଦନ କିମ୍ବା ବିବରଣୀ ଅଦ୍ୟତନ କରିବାର ସୂଚନା ପାଆନ୍ତୁ।",
    },
    "pm-kisan": {
      name: "ପିଏମ୍-କିସାନ",
      description: "ଯୋଜନା ସୂଚନା, ପଞ୍ଜୀକରଣ ମାର୍ଗଦର୍ଶନ ଏବଂ ହିତାଧିକାରୀ ସେବା ପାଇଁ ସରକାରୀ ପିଏମ୍-କିସାନ ପୋର୍ଟାଲ୍ ଦେଖନ୍ତୁ।",
    },
  },
  pa: {
    "aadhaar-update": {
      name: "ਆਧਾਰ ਸੇਵਾਵਾਂ",
      description: "ਆਧਾਰ ਦਰਜ ਕਰਵਾਉਣ, ਅੱਪਡੇਟ, ਸਥਿਤੀ ਦੀ ਜਾਂਚ ਅਤੇ ਸੰਬੰਧਿਤ ਸੇਵਾਵਾਂ ਬਾਰੇ ਸਰਕਾਰੀ ਜਾਣਕਾਰੀ ਲਵੋ।",
    },
    "pan-card": {
      name: "ਪੈਨ ਕਾਰਡ ਲਈ ਅਰਜ਼ੀ",
      description: "ਆਮਦਨ ਕਰ ਵਿਭਾਗ ਰਾਹੀਂ ਸਥਾਈ ਖਾਤਾ ਨੰਬਰ (PAN) ਲਈ ਅਰਜ਼ੀ ਦੇਣ ਜਾਂ ਵੇਰਵੇ ਅੱਪਡੇਟ ਕਰਨ ਬਾਰੇ ਜਾਣੋ।",
    },
    "pm-kisan": {
      name: "ਪੀਐਮ-ਕਿਸਾਨ",
      description: "ਯੋਜਨਾ ਦੀ ਜਾਣਕਾਰੀ, ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਲਈ ਮਦਦ ਅਤੇ ਲਾਭਪਾਤਰੀ ਸੇਵਾਵਾਂ ਵਾਸਤੇ ਸਰਕਾਰੀ ਪੀਐਮ-ਕਿਸਾਨ ਪੋਰਟਲ ਵੇਖੋ।",
    },
  },
  ta: {
    "aadhaar-update": {
      name: "ஆதார் சேவைகள்",
      description: "ஆதார் பதிவு, புதுப்பிப்பு, நிலை சரிபார்ப்பு மற்றும் தொடர்புடைய சேவைகள் பற்றிய அதிகாரப்பூர்வ தகவலைப் பெறுங்கள்.",
    },
    "pan-card": {
      name: "பான் அட்டை விண்ணப்பம்",
      description: "வருமான வரித் துறை மூலம் நிரந்தர கணக்கு எண்ணுக்கு (PAN) விண்ணப்பிப்பது அல்லது விவரங்களைப் புதுப்பிப்பது எப்படி என அறியுங்கள்.",
    },
    "pm-kisan": {
      name: "பி.எம்-கிசான்",
      description: "திட்டத் தகவல், பதிவுக்கான வழிகாட்டுதல் மற்றும் பயனாளர் சேவைகளுக்கு அதிகாரப்பூர்வ பி.எம்-கிசான் இணையதளத்தைப் பாருங்கள்.",
    },
  },
  te: {
    "aadhaar-update": {
      name: "ఆధార్ సేవలు",
      description: "ఆధార్ నమోదు, నవీకరణలు, స్థితి తనిఖీ మరియు సంబంధిత సేవల అధికారిక సమాచారాన్ని పొందండి.",
    },
    "pan-card": {
      name: "పాన్ కార్డు దరఖాస్తు",
      description: "ఆదాయపు పన్ను శాఖ ద్వారా శాశ్వత ఖాతా సంఖ్య (PAN) కోసం దరఖాస్తు చేయడం లేదా వివరాలను నవీకరించడం గురించి తెలుసుకోండి.",
    },
    "pm-kisan": {
      name: "పీఎం-కిసాన్",
      description: "పథకం సమాచారం, నమోదు మార్గదర్శకం మరియు లబ్ధిదారుల సేవల కోసం అధికారిక పీఎం-కిసాన్ పోర్టల్‌ను చూడండి.",
    },
  },
  ur: {
    "aadhaar-update": {
      name: "آدھار خدمات",
      description: "آدھار اندراج، تازہ کاری، حیثیت کی جانچ اور متعلقہ خدمات کی سرکاری معلومات حاصل کریں۔",
    },
    "pan-card": {
      name: "پین کارڈ کی درخواست",
      description: "محکمہ انکم ٹیکس کے ذریعے مستقل اکاؤنٹ نمبر (PAN) کے لیے درخواست دینے یا تفصیلات تازہ کرنے کا طریقہ جانیں۔",
    },
    "pm-kisan": {
      name: "پی ایم-کسان",
      description: "اسکیم کی معلومات، رجسٹریشن کی رہنمائی اور مستفیدین کی خدمات کے لیے سرکاری پی ایم-کسان پورٹل دیکھیں۔",
    },
  },
  brx: {
    "aadhaar-update": {
      name: "आधार सेवा",
      description: "आधार एनरोलमेन्ट, अपडेट, थाथाइ आनजाद आरो सोमोन्दोगोनां सेवाफोरनि सरकारि फोरमायथि नागिर।",
    },
    "pan-card": {
      name: "पेन कार्डनि आबेदन",
      description: "आयकर बिभागनि गेजेरजों स्थायी खाता नम्बर (PAN)नि थाखाय आबेदन खालामनाय एबा बिबोर अपडेट खालामनायनि थाखाय सोलों।",
    },
    "pm-kisan": {
      name: "पीएम-किसान",
      description: "स्किमनि फोरमायथि, रेजिस्ट्रेसननि राह देखायथि आरो लाभग्राही सेवाफोरनि थाखाय सरकारि पीएम-किसान पोर्टेलखौ नाय।",
    },
  },
  doi: {
    "aadhaar-update": {
      name: "आधार सेवां",
      description: "आधार पंजीकरण, अपडेट, स्थिति दी जांच ते होर सेवाएं बारे सरकारी जानकारी हासल करो।",
    },
    "pan-card": {
      name: "पैन कार्ड आवेदन",
      description: "आयकर विभाग दे राहें स्थायी खाता नंबर (PAN) लेई आवेदन करने जां जानकारी अपडेट करने बारे जानो।",
    },
    "pm-kisan": {
      name: "पीएम-किसान",
      description: "योजना दी जानकारी, पंजीकरण दी राहनुमाई ते लाभार्थी सेवाएं लेई सरकारी पीएम-किसान पोर्टल दिक्खो।",
    },
  },
  ks: {
    "aadhaar-update": {
      name: "آدھار خٕدمات",
      description: "آدھار اندراج، تازہ کاری، حالتٕک جانچ تہٕ متعلقہ خٕدماتٕچ سرکاری معلومات ژھانڈیو۔",
    },
    "pan-card": {
      name: "پین کارڈ درخواست",
      description: "محکمہ انکم ٹیکس ذریعہ مستقل اکاؤنٹ نمبر (PAN) خٲطرٕ درخواست دِنچ یا تفصیل تازہ کرنچ معلومات حٲصِل کٔریو۔",
    },
    "pm-kisan": {
      name: "پی ایم کسان",
      description: "سکیمہِ ہنز معلومات، رجسٹریشن ہدایت تہٕ مستفیدین خٕدمات خٲطرٕ سرکاری پی ایم کسان پورٹل وُچھو۔",
    },
  },
  kok: {
    "aadhaar-update": {
      name: "आधार सेवा",
      description: "आधार नोंदणी, अद्ययावत, स्थिती तपासणी आनी संबंदीत सेवांची सरकारी म्हायती मेळयात.",
    },
    "pan-card": {
      name: "पॅन कार्ड अर्ज",
      description: "आयकर विभागा वरवीं कायम खातें क्रमांक (PAN) खातीर अर्ज करप वा तपशील अद्ययावत करपाची म्हायती मेळयात.",
    },
    "pm-kisan": {
      name: "पीएम-किसान",
      description: "येवजणेची म्हायती, नोंदणी मार्गदर्शन आनी लाभार्थी सेवां खातीर सरकारी पीएम-किसान पोर्टल पळयात.",
    },
  },
  mai: {
    "aadhaar-update": {
      name: "आधार सेवा",
      description: "आधार नामांकन, अद्यतन, स्थिति जाँच आओर संबंधित सेवाक सरकारी जानकारी पाउ।",
    },
    "pan-card": {
      name: "पैन कार्ड आवेदन",
      description: "आयकर विभागक माध्यमसँ स्थायी खाता संख्या (PAN) लेल आवेदन करबाक वा विवरण अद्यतन करबाक जानकारी पाउ।",
    },
    "pm-kisan": {
      name: "पीएम-किसान",
      description: "योजनाक जानकारी, पंजीकरण मार्गदर्शन आओर लाभार्थी सेवाक लेल सरकारी पीएम-किसान पोर्टल देखू।",
    },
  },
  mni: {
    "aadhaar-update": {
      name: "আধার সেবা",
      description: "আধার এনরোলমেন্ত, অপদেত, ফংদোকপগী থৌদাং অমসুং মরী লৈনবা সেবাশিংগী সরকারগী ৱারোল ফংবিয়ু।",
    },
    "pan-card": {
      name: "পেন কার্ড আবেদন",
      description: "ইনকাম টেক্স ডিপার্টমেন্তগী মখাদা পার্মানেন্ত একাউন্ট নম্বর (PAN)গীদমক আবেদন তৌবা নত্রগা মশক-মওং অপদেত তৌবগী মওং খঙবিয়ু।",
    },
    "pm-kisan": {
      name: "পিএম-কিষাণ",
      description: "স্কীমগী ৱারোল, রেজিস্ট্রেসনগী পথপ্রদর্শন অমসুং বেনিফিসিয়ারী সেবাশিংগীদমক সরকারগী পিএম-কিষাণ পোর্টেল ইয়েংবিয়ু।",
    },
  },
  sa: {
    "aadhaar-update": {
      name: "आधारसेवाः",
      description: "आधारनामाङ्कनस्य, नवीकरणस्य, स्थितिपरीक्षणस्य, सम्बद्धसेवानां च आधिकारिकं विवरणं प्राप्नोतु।",
    },
    "pan-card": {
      name: "पैनपत्रस्य आवेदनम्",
      description: "आयकरविभागस्य माध्यमेन स्थायिखातासङ्ख्यायै (PAN) आवेदनस्य विवरणनवीकरणस्य वा मार्गं जानीयात्।",
    },
    "pm-kisan": {
      name: "पीएम-किसान्",
      description: "योजनायाः विवरणाय, पञ्जीकरणमार्गदर्शनाय, लाभार्थिसेवाभ्यश्च आधिकारिकं पीएम-किसान् पोर्टल् पश्यतु।",
    },
  },
  sat: {
    "aadhaar-update": {
      name: "आधार सेवा",
      description: "आधार एनरोलमेंट, अपडेट, ओबोसता जांच आर संबंधाक् सेवा रेयाक् सरकारी खोबोर ञाम मे।",
    },
    "pan-card": {
      name: "पेन कार्ड आवेदन",
      description: "इनकम टैक्स विभाग दाराय ते स्थायी खाता नंबर (PAN) लािगित् आवेदन आर बिबरो अपडेट रेयाक् उपाइ ञाम मे।",
    },
    "pm-kisan": {
      name: "पीएम-किसान",
      description: "योजना खोबोर, रजिस्ट्रेशन राह देखाव आर लाभ पेमोक् को सेवा लािगित् सरकारी पीएम-किसान पोर्टल ञेल मे।",
    },
  },
  sd: {
    "aadhaar-update": {
      name: "آڌار خدمتون",
      description: "آڌار داخلا، تازه ڪاري، حالت جي جاچ ۽ لاڳاپيل خدمتن جي سرڪاري ڄاڻ حاصل ڪريو۔",
    },
    "pan-card": {
      name: "پين ڪارڊ درخواست",
      description: "انڪم ٽيڪس کاتي ذريعي مستقل اڪائونٽ نمبر (PAN) لاءِ درخواست يا تفصيل تازه ڪرڻ بابت ڄاڻ حاصل ڪريو۔",
    },
    "pm-kisan": {
      name: "پي ايم-ڪسان",
      description: "اسڪيم جي ڄاڻ، رجسٽريشن رهنمائي ۽ فائدو وٺندڙن جي خدمتن لاءِ سرڪاري پي ايم-ڪسان پورٽل ڏسو۔",
    },
  },
};

export function getLocalizedService(
  serviceId: string,
  language: LanguageCode,
) {
  const original = services.find((service) => service.id === serviceId);

  if (!original) return undefined;

  const translated = serviceTranslations[language]?.[serviceId];
  const catalogTranslation =
    catalogServiceTranslations[language]?.[serviceId];

  return {
    ...original,
    ...translated,
    ...catalogTranslation,
    category: searchCategoryTranslations[language][original.category],
  };
}

export function hasLocalizedServiceField(
  serviceId: string,
  language: LanguageCode,
  field: keyof LocalizedServiceContent,
): boolean {
  const original = services.find((service) => service.id === serviceId);
  if (!original) return false;
  if (language === "en") return true;

  if (field === "category") {
    const category = searchCategoryTranslations[language][original.category];
    return typeof category === "string" && category.trim() !== "";
  }

  if (field === "name" && officialServiceNames[serviceId] === original.name) {
    return true;
  }

  const catalogTranslation =
    field === "name" || field === "description"
      ? catalogServiceTranslations[language]?.[serviceId]?.[field]
      : undefined;
  const translated =
    catalogTranslation ?? serviceTranslations[language]?.[serviceId]?.[field];
  return (
    typeof translated === "string" &&
    translated.trim() !== "" &&
    translated !== original[field]
  );
}

export function getServiceText(
  serviceId: string,
  language: LanguageCode,
  field: keyof LocalizedServiceContent,
): string {
  const service = getLocalizedService(serviceId, language);
  return service?.[field] ?? "";
}

export function getHomeServiceText(
  serviceId: string,
  language: LanguageCode,
  field: "name" | "description",
): string {
  const original = services.find((service) => service.id === serviceId);

  if (!original) {
    console.error(`[Saarthi] Unknown Home service: ${serviceId}`);
    return `[missing service: ${serviceId}]`;
  }

  if (language === "en") {
    return original[field];
  }

  const translated = serviceTranslations[language]?.[serviceId]?.[field];

  if (typeof translated === "string" && translated.trim()) {
    return translated;
  }

  console.warn(
    `[Saarthi] Missing Home service translation: ${language}.${serviceId}.${field}`,
  );
  return `[${language}.${serviceId}.${field}]`;
}