export type SupportedLanguage = "en-IN" | "hi-IN" | "mr-IN" | "gu-IN";

export interface LanguageOption {
  code: SupportedLanguage;
  nativeName: string;
  englishName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en-IN", nativeName: "English", englishName: "English" },
  { code: "hi-IN", nativeName: "हिंदी", englishName: "Hindi" },
  { code: "mr-IN", nativeName: "मराठी", englishName: "Marathi" },
  { code: "gu-IN", nativeName: "ગુજરાતી", englishName: "Gujarati" },
];

export interface UIStrings {
  brandSubtitle: string;
  modelBadgePrefix: string;
  navShowroom: string;
  navWorkspace: string;
  navHistory: string;
  call112: string;
  themeLight: string;
  themeDark: string;
  view3D: string;
  view2D: string;

  // Showroom Hero
  heroHeadlinePart1: string;
  heroHeadlineHighlight: string;
  heroSupportText: string;
  btnLiveDemo: string;
  btnEnterWorkspace: string;
  emergencySkipPrompt: string;
  emergencyCallNow: string;
  hotspotsHeader: string;
  hotspotsHint: string;
  hotspots: {
    multimodalTitle: string;
    multimodalDesc: string;
    evidenceTitle: string;
    evidenceDesc: string;
    bridgeTitle: string;
    bridgeDesc: string;
  };

  // Input Console
  inputHeading: string;
  inputSubheading: string;
  clearBtn: string;
  demoSectionTitle: string;
  loadScenario: string;
  whatHappenedLabel: string;
  inputPlaceholder: string;
  locationLabel: string;
  locationPlaceholder: string;
  shareLocationBtn: string;
  locationSharedBtn: string;
  attachPhotoBtn: string;
  photoReadyLabel: string;
  photoUncertaintyNote: string;
  analyzeBtn: string;
  analyzingBtn: string;
  immediateDangerNote: string;

  // Voice states
  voiceReady: string;
  voiceRequesting: string;
  voiceListening: string;
  voiceStop: string;
  voiceTranscribed: string;
  voicePermissionDenied: string;
  voiceFailed: string;
  voiceUnsupported: string;

  // Results / Emergency-First Output
  uncertaintyBanner: string;
  urgencyAdvisoryNote: string;
  urgencyLabels: {
    CRITICAL: string;
    HIGH: string;
    MODERATE: string;
    LOW: string;
    UNCERTAIN: string;
    NON_EMERGENCY: string;
  };
  whatToDoNowHeading: string;
  copyBriefBtn: string;
  copiedBriefBtn: string;
  shareSmsBtn: string;
  shareWhatsappBtn: string;
  quickViewTab: string;
  detailedViewTab: string;

  // Detailed View Sections
  summaryAndLocationHeading: string;
  evidenceMatrixHeading: string;
  reportedInfoCol: string;
  reportedInfoSub: string;
  aiRisksCol: string;
  aiRisksSub: string;
  missingInfoCol: string;
  missingInfoSub: string;
  evidenceTraceHeading: string;
  correctionHeading: string;
  correctionPlaceholder: string;
  updateAnalysisBtn: string;
  updatingAnalysisBtn: string;
  warningsHeading: string;
  editableBriefHeading: string;
  nonDispatchDisclaimer: string;

  // Empty & History States
  readyTitle: string;
  readyDescription: string;
  historyHeading: string;
  historyEmpty: string;
  newAnalysisBtn: string;
}

export const UI_TRANSLATIONS: Record<SupportedLanguage, UIStrings> = {
  "en-IN": {
    brandSubtitle: "From Chaos to Action",
    modelBadgePrefix: "Powered by Google",
    navShowroom: "Showroom",
    navWorkspace: "Workspace",
    navHistory: "History",
    call112: "Call 112",
    themeLight: "Light",
    themeDark: "Dark",
    view3D: "3D Core",
    view2D: "2D Lite",

    heroHeadlinePart1: "From Human Panic to",
    heroHeadlineHighlight: "Informed Action.",
    heroSupportText:
      "Transform uncertain situations into structured information and clearer next steps.",
    btnLiveDemo: "1-Tap Live Demo",
    btnEnterWorkspace: "Enter Incident Workspace",
    emergencySkipPrompt: "Facing a real emergency right now?",
    emergencyCallNow: "Dial 112 Immediately",
    hotspotsHeader: "Interactive System Architecture",
    hotspotsHint: "Select or Tab",
    hotspots: {
      multimodalTitle: "Multimodal Intelligence",
      multimodalDesc:
        "Understands voice, text, and scene photos across English, Hindi, Marathi, and Gujarati.",
      evidenceTitle: "Evidence & Uncertainty Engine",
      evidenceDesc:
        "Separates reported facts from AI interpretations and highlights unanswered questions.",
      bridgeTitle: "Emergency Action Bridge",
      bridgeDesc:
        "Delivers up to three immediate safety steps, an editable 112 brief, and direct 112 calling.",
    },

    inputHeading: "Describe the Situation",
    inputSubheading:
      "Speak or type in English, Hindi, Marathi, Gujarati, or Hinglish, or attach a photo.",
    clearBtn: "Clear",
    demoSectionTitle: "Fictional Test Scenarios",
    loadScenario: "Load",
    whatHappenedLabel: "What happened? (Review before analyzing)",
    inputPlaceholder:
      "Example: Basement mein paani bhar gaya hai aur meter se sparks aa rahe hain...",
    locationLabel: "Location or Landmark (Optional)",
    locationPlaceholder: "Street, building name, floor, or highway landmark...",
    shareLocationBtn: "Share My Location",
    locationSharedBtn: "Location Shared",
    attachPhotoBtn: "Attach Scene Photo (Optional)",
    photoReadyLabel: "Photo Attached",
    photoUncertaintyNote: "AI visual observations may contain uncertainty.",
    analyzeBtn: "Analyze with Gemini",
    analyzingBtn: "Analyzing with Gemini...",
    immediateDangerNote: "In immediate danger? Do not wait for analysis.",

    voiceReady: "Voice Input",
    voiceRequesting: "Requesting Mic...",
    voiceListening: "Listening... Speak now",
    voiceStop: "Stop Mic",
    voiceTranscribed: "Transcript added to box",
    voicePermissionDenied:
      "Microphone permission denied. Please allow mic access or type below.",
    voiceFailed: "Could not capture speech clearly. Please try again or type below.",
    voiceUnsupported:
      "Browser speech recognition is not supported on this device. Please type below.",

    uncertaintyBanner:
      "Based on the details provided; the incident has not been independently verified.",
    urgencyAdvisoryNote: "Advisory assessment — not certified medical/emergency triage",
    urgencyLabels: {
      CRITICAL: "Critical",
      HIGH: "High",
      MODERATE: "Moderate",
      LOW: "Low",
      UNCERTAIN: "Uncertain",
      NON_EMERGENCY: "Low / No Emergency Established",
    },
    whatToDoNowHeading: "What To Do Right Now",
    copyBriefBtn: "Copy Emergency Brief",
    copiedBriefBtn: "Brief Copied",
    shareSmsBtn: "SMS Brief",
    shareWhatsappBtn: "WhatsApp Brief",
    quickViewTab: "Quick View (Immediate Steps)",
    detailedViewTab: "Detailed View (Evidence & Trace)",

    summaryAndLocationHeading: "Incident Summary & Rationale",
    evidenceMatrixHeading: "Evidence & Uncertainty Matrix",
    reportedInfoCol: "Reported Information",
    reportedInfoSub: "Directly stated by user or observed in media",
    aiRisksCol: "AI-Identified Risks",
    aiRisksSub: "Possible interpretations — not confirmed facts",
    missingInfoCol: "Missing Information",
    missingInfoSub: "Important unanswered questions",
    evidenceTraceHeading: "Evidence Trace (Inspect Source)",
    correctionHeading: "Correct or Add Details",
    correctionPlaceholder:
      'Example: "They are on the second floor, not in the basement."',
    updateAnalysisBtn: "Update Analysis",
    updatingAnalysisBtn: "Updating...",
    warningsHeading: "Safety Warnings (Avoid Doing)",
    editableBriefHeading: "Full 112 Emergency Brief (Editable)",
    nonDispatchDisclaimer:
      "Sharing via SMS or WhatsApp does not automatically dispatch 112 services. Always call 112 directly.",

    readyTitle: "Ready for Incident Analysis",
    readyDescription:
      "Select a fictional scenario on the left or describe your situation to receive immediate, structured safety steps.",
    historyHeading: "Session History",
    historyEmpty: "No incidents analyzed in this session yet.",
    newAnalysisBtn: "+ New Analysis",
  },

  "hi-IN": {
    brandSubtitle: "घबराहट से सही कदम तक",
    modelBadgePrefix: "Google द्वारा संचालित",
    navShowroom: "शोकेस",
    navWorkspace: "कार्यक्षेत्र",
    navHistory: "इतिहास",
    call112: "112 पर कॉल करें",
    themeLight: "लाइट",
    themeDark: "डार्क",
    view3D: "3D दृश्य",
    view2D: "2D लाइट",

    heroHeadlinePart1: "मानवीय घबराहट से",
    heroHeadlineHighlight: "सही और सुरक्षित कदम।",
    heroSupportText:
      "अनिश्चित आपातकालीन स्थितियों को स्पष्ट जानकारी और तुरंत उठाए जाने वाले सुरक्षित कदमों में बदलें।",
    btnLiveDemo: "1-टैप लाइव डेमो",
    btnEnterWorkspace: "आपातकालीन कार्यक्षेत्र खोलें",
    emergencySkipPrompt: "क्या आप अभी वास्तविक संकट में हैं?",
    emergencyCallNow: "तुरंत 112 डायल करें",
    hotspotsHeader: "प्रणाली की मुख्य विशेषताएं",
    hotspotsHint: "चुनें या टैब दबाएं",
    hotspots: {
      multimodalTitle: "मल्टीमॉडल समझ",
      multimodalDesc:
        "आवाज़, टेक्स्ट और फोटो को हिंदी, अंग्रेजी, मराठी और गुजराती में समझता है।",
      evidenceTitle: "तथ्य और अनिश्चितता इंजन",
      evidenceDesc:
        "उपयोगकर्ता द्वारा बताए गए तथ्यों को AI के अनुमानों और अधूरे सवालों से अलग रखता है।",
      bridgeTitle: "112 आपातकालीन ब्रिज",
      bridgeDesc:
        "तीन मुख्य सुरक्षा कदम, 112 संक्षिप्त रिपोर्ट और सीधी 112 कॉल सुविधा देता है।",
    },

    inputHeading: "स्थिति का विवरण दें",
    inputSubheading:
      "हिंदी, अंग्रेजी, मराठी, गुजराती या हिंग्लिश में लिखें/बोलें, या फोटो जोड़ें।",
    clearBtn: "साफ़ करें",
    demoSectionTitle: "काल्पनिक परीक्षण परिदृश्य (डेमो)",
    loadScenario: "चुनें",
    whatHappenedLabel: "क्या हुआ है? (विश्लेषण से पहले जांचें)",
    inputPlaceholder:
      "उदाहरण: अपार्टमेंट के बेसमेंट में पानी भर गया है और बिजली के मीटर से चिंगारी निकल रही है...",
    locationLabel: "स्थान या लैंडमार्क (वैकल्पिक)",
    locationPlaceholder: "गली, इमारत का नाम, मंज़िल या हाईवे लैंडमार्क लिखें...",
    shareLocationBtn: "मेरी लोकेशन साझा करें",
    locationSharedBtn: "लोकेशन जुड़ गई",
    attachPhotoBtn: "घटना की फोटो जोड़ें (वैकल्पिक)",
    photoReadyLabel: "फोटो तैयार है",
    photoUncertaintyNote: "फोटो के AI विश्लेषण में अनिश्चितता हो सकती है।",
    analyzeBtn: "Gemini से विश्लेषण करें",
    analyzingBtn: "Gemini विश्लेषण कर रहा है...",
    immediateDangerNote: "तत्काल खतरे में हैं? AI का इंतज़ार न करें।",

    voiceReady: "बोलकर लिखें",
    voiceRequesting: "माइक अनुमति...",
    voiceListening: "सुन रहा है... अब बोलें",
    voiceStop: "रोकें",
    voiceTranscribed: "आवाज़ टेक्स्ट में बदल दी गई",
    voicePermissionDenied:
      "माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया अनुमति दें या नीचे टाइप करें।",
    voiceFailed: "आवाज़ स्पष्ट नहीं सुनाई दी। कृपया दोबारा बोलें या टाइप करें।",
    voiceUnsupported:
      "इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया नीचे टाइप करें।",

    uncertaintyBanner:
      "दी गई जानकारी पर आधारित; इस घटना की स्वतंत्र रूप से पुष्टि नहीं हुई है।",
    urgencyAdvisoryNote: "सलाहकार मूल्यांकन — प्रमाणित मेडिकल ट्रायज नहीं",
    urgencyLabels: {
      CRITICAL: "अति गंभीर (Critical)",
      HIGH: "उच्च (High)",
      MODERATE: "मध्यम (Moderate)",
      LOW: "कम (Low)",
      UNCERTAIN: "अनिश्चित (Uncertain)",
      NON_EMERGENCY: "कोई आपातकाल नहीं",
    },
    whatToDoNowHeading: "अभी तुरंत क्या करें",
    copyBriefBtn: "रिपोर्ट कॉपी करें",
    copiedBriefBtn: "कॉपी हो गया",
    shareSmsBtn: "SMS भेजें",
    shareWhatsappBtn: "WhatsApp साझा करें",
    quickViewTab: "त्वरित दृश्य (तुरंत कदम)",
    detailedViewTab: "विस्तृत दृश्य (तथ्य और प्रमाण)",

    summaryAndLocationHeading: "घटना का सारांश और कारण",
    evidenceMatrixHeading: "तथ्य और अनिश्चितता तालिका",
    reportedInfoCol: "बताई गई जानकारी",
    reportedInfoSub: "उपयोगकर्ता द्वारा सीधे बताया गया",
    aiRisksCol: "AI द्वारा पहचाने गए जोखिम",
    aiRisksSub: "संभावित खतरे — पुष्ट तथ्य नहीं",
    missingInfoCol: "अधूरी जानकारी",
    missingInfoSub: "महत्वपूर्ण अनुत्तरित प्रश्न",
    evidenceTraceHeading: "प्रमाण स्रोत जांचें",
    correctionHeading: "जानकारी सुधारें या जोड़ें",
    correctionPlaceholder:
      'उदाहरण: "वे दूसरी मंज़िल पर हैं, बेसमेंट में नहीं।"',
    updateAnalysisBtn: "विश्लेषण अपडेट करें",
    updatingAnalysisBtn: "अपडेट हो रहा है...",
    warningsHeading: "सुरक्षा चेतावनियां (यह न करें)",
    editableBriefHeading: "112 आपातकालीन संक्षिप्त रिपोर्ट",
    nonDispatchDisclaimer:
      "SMS या WhatsApp तैयार करने से 112 टीम अपने आप रवाना नहीं होती। आधिकारिक मदद के लिए 112 पर कॉल करें।",

    readyTitle: "विश्लेषण के लिए तैयार",
    readyDescription:
      "बाईं ओर से एक डेमो परिदृश्य चुनें या अपनी स्थिति लिखें ताकि तुरंत सुरक्षा कदम मिल सकें।",
    historyHeading: "सत्र इतिहास",
    historyEmpty: "इस सत्र में अभी तक कोई विश्लेषण नहीं किया गया है।",
    newAnalysisBtn: "+ नया विश्लेषण",
  },

  "mr-IN": {
    brandSubtitle: "गोंधळातून योग्य कृतीकडे",
    modelBadgePrefix: "Google द्वारे संचलित",
    navShowroom: "शोकेस",
    navWorkspace: "कार्यक्षेत्र",
    navHistory: "इतिहास",
    call112: "112 वर कॉल करा",
    themeLight: "लाईट",
    themeDark: "डार्क",
    view3D: "3D कोअर",
    view2D: "2D लाईट",

    heroHeadlinePart1: "मानवी भीतीतून",
    heroHeadlineHighlight: "योग्य आणि सुरक्षित कृती.",
    heroSupportText:
      "अनिश्चित आपत्कालीन परिस्थितीचे स्पष्ट माहितीत आणि तातडीच्या सुरक्षित पावलांमध्ये रूपांतर करा.",
    btnLiveDemo: "1-टॅप लाईव्ह डेमो",
    btnEnterWorkspace: "आपत्कालीन कार्यक्षेत्र उघडा",
    emergencySkipPrompt: "सध्या प्रत्यक्ष संकटात आहात का?",
    emergencyCallNow: "ताबडतोब 112 डायल करा",
    hotspotsHeader: "प्रणालीची प्रमुख वैशिष्ट्ये",
    hotspotsHint: "निवडा किंवा टॅब दाबा",
    hotspots: {
      multimodalTitle: "मल्टीमॉडल बुद्धिमत्ता",
      multimodalDesc:
        "मराठी, हिंदी, इंग्रजी आणि गुजरातीमधील आवाज, मजकूर आणि फोटो समजून घेते.",
      evidenceTitle: "तथ्य आणि अनिश्चितता इंजिन",
      evidenceDesc:
        "दिलेली प्रत्यक्ष माहिती, AI चे अंदाज आणि अनुत्तरित प्रश्न स्पष्टपणे वेगळे ठेवते.",
      bridgeTitle: "112 आपत्कालीन कृती सेतू",
      bridgeDesc:
        "तीन तातडीची सुरक्षा पावले, 112 संक्षिप्त अहवाल आणि थेट 112 कॉल सुविधा देते.",
    },

    inputHeading: "परिस्थितीचे वर्णन करा",
    inputSubheading:
      "मराठी, हिंदी, इंग्रजी, गुजराती किंवा हिंग्लिशमध्ये टाइप करा/बोला किंवा फोटो जोडा.",
    clearBtn: "पुसा",
    demoSectionTitle: "काल्पनिक चाचणी उदाहरणे (डेमो)",
    loadScenario: "निवडा",
    whatHappenedLabel: "काय घडले आहे? (विश्लेषणापूर्वी तपासा)",
    inputPlaceholder:
      "उदाहरण: इमारतीच्या तळघरात पाणी साचले आहे आणि इलेक्ट्रिक मीटरमधून ठिणग्या येत आहेत...",
    locationLabel: "ठिकाण किंवा लँडमार्क (ऐच्छिक)",
    locationPlaceholder: "रस्ता, इमारतीचे नाव, मजला किंवा महामार्ग खूण लिहा...",
    shareLocationBtn: "माझे लोकेशन शेअर करा",
    locationSharedBtn: "लोकेशन जोडले",
    attachPhotoBtn: "घटनेचा फोटो जोडा (ऐच्छिक)",
    photoReadyLabel: "फोटो जोडला आहे",
    photoUncertaintyNote: "फोटोच्या AI निरीक्षणात अनिश्चितता असू शकते.",
    analyzeBtn: "Gemini ने विश्लेषण करा",
    analyzingBtn: "Gemini विश्लेषण करत आहे...",
    immediateDangerNote: "तातडीच्या धोक्यात आहात? AI ची वाट पाहू नका.",

    voiceReady: "आवाजाने टाइप करा",
    voiceRequesting: "माइक परवानगी...",
    voiceListening: "ऐकत आहे... आता बोला",
    voiceStop: "थांबा",
    voiceTranscribed: "आवाज मजकुरात बदलला",
    voicePermissionDenied:
      "मायक्रोफोन परवानगी नाकारली. कृपया परवानगी द्या किंवा खाली टाइप करा.",
    voiceFailed: "आवाज स्पष्ट समजला नाही. कृपया पुन्हा प्रयत्न करा किंवा टाइप करा.",
    voiceUnsupported:
      "या ब्राउझरमध्ये व्हॉइस इनपुट उपलब्ध नाही. कृपया खाली टाइप करा.",

    uncertaintyBanner:
      "दिलेल्या माहितीवर आधारित; या घटनेची स्वतंत्रपणे पडताळणी झालेली नाही.",
    urgencyAdvisoryNote: "सल्लागार मूल्यांकन — प्रमाणित वैद्यकीय ट्रायज नाही",
    urgencyLabels: {
      CRITICAL: "अतिगंभीर (Critical)",
      HIGH: "उच्च (High)",
      MODERATE: "मध्यम (Moderate)",
      LOW: "कमी (Low)",
      UNCERTAIN: "अनिश्चित (Uncertain)",
      NON_EMERGENCY: "आणीबाणी नाही",
    },
    whatToDoNowHeading: "आता ताबडतोब काय करावे",
    copyBriefBtn: "अहवाल कॉपी करा",
    copiedBriefBtn: "कॉपी झाले",
    shareSmsBtn: "SMS तयार करा",
    shareWhatsappBtn: "WhatsApp शेअर",
    quickViewTab: "जलद दृश्य (तातडीची पावले)",
    detailedViewTab: "सविस्तर दृश्य (तथ्य आणि पुरावे)",

    summaryAndLocationHeading: "घटना सारांश आणि कारण",
    evidenceMatrixHeading: "तथ्य आणि अनिश्चितता तक्ता",
    reportedInfoCol: "दिलेली माहिती",
    reportedInfoSub: "वापरकर्त्याने सांगितलेली किंवा फोटोतील माहिती",
    aiRisksCol: "AI ने ओळखलेले धोके",
    aiRisksSub: "संभाव्य अंदाज — सिद्ध झालेले तथ्य नाही",
    missingInfoCol: "अपूर्ण माहिती",
    missingInfoSub: "महत्त्वाचे अनुत्तरित प्रश्न",
    evidenceTraceHeading: "पुराव्याचा स्रोत तपासा",
    correctionHeading: "माहिती सुधारा किंवा जोडा",
    correctionPlaceholder:
      'उदाहरण: "ते दुसऱ्या मजल्यावर आहेत, तळघरात नाहीत."',
    updateAnalysisBtn: "विश्लेषण अपडेट करा",
    updatingAnalysisBtn: "अपडेट होत आहे...",
    warningsHeading: "सुरक्षा इशारे (हे करू नका)",
    editableBriefHeading: "112 आपत्कालीन संक्षिप्त अहवाल",
    nonDispatchDisclaimer:
      "SMS किंवा WhatsApp तयार केल्याने 112 मदत आपोआप पाठवली जात नाही. अधिकृत मदतीसाठी 112 वर कॉल करा.",

    readyTitle: "विश्लेषणासाठी तयार",
    readyDescription:
      "डावीकडील चाचणी उदाहरण निवडा किंवा तुमची परिस्थिती लिहा जेणेकरून तातडीची सुरक्षा पावले मिळतील.",
    historyHeading: "सत्र इतिहास",
    historyEmpty: "या सत्रात अद्याप कोणतेही विश्लेषण केलेले नाही.",
    newAnalysisBtn: "+ नवीन विश्लेषण",
  },

  "gu-IN": {
    brandSubtitle: "ગભરાટથી યોગ્ય પગલાં તરફ",
    modelBadgePrefix: "Google દ્વારા સંચાલિત",
    navShowroom: "શોકેસ",
    navWorkspace: "કાર્યક્ષેત્ર",
    navHistory: "ઇતિહાસ",
    call112: "112 પર કૉલ કરો",
    themeLight: "લાઇટ",
    themeDark: "ડાર્ક",
    view3D: "3D કોર",
    view2D: "2D લાઇટ",

    heroHeadlinePart1: "માનવીય ગભરાટથી",
    heroHeadlineHighlight: "સુરક્ષિત અને સ્પષ્ટ પગલાં.",
    heroSupportText:
      "અનિશ્ચિત કટોકટીની પરિસ્થિતિઓને સ્પષ્ટ માહિતી અને તાત્કાલિક સુરક્ષા પગલાંમાં રૂપાંતરિત કરો.",
    btnLiveDemo: "1-ટૅપ લાઇવ ડેમો",
    btnEnterWorkspace: "કટોકટી કાર્યક્ષેત્ર ખોલો",
    emergencySkipPrompt: "શું તમે અત્યારે વાસ્તવિક કટોકટીમાં છો?",
    emergencyCallNow: "તરત જ 112 ડાયલ કરો",
    hotspotsHeader: "સિસ્ટમની મુખ્ય વિશેષતાઓ",
    hotspotsHint: "પસંદ કરો અથવા ટૅબ દબાવો",
    hotspots: {
      multimodalTitle: "મલ્ટીમોડલ સમજણ",
      multimodalDesc:
        "ગુજરાતી, હિન્દી, મરાઠી અને અંગ્રેજીમાં અવાજ, લખાણ અને ફોટા સમજે છે.",
      evidenceTitle: "પુરાવા અને અનિશ્ચિતતા એન્જિન",
      evidenceDesc:
        "જણાવેલી હકીકતોને AI ના અનુમાનો અને ખૂટતી માહિતીથી અલગ પાડે છે.",
      bridgeTitle: "112 કટોકટી બ્રિજ",
      bridgeDesc:
        "ત્રણ તાત્કાલિક સુરક્ષા પગલાં, 112 સંક્ષિપ્ત અહેવાલ અને સીધો 112 કૉલ આપે છે.",
    },

    inputHeading: "પરિસ્થિતિનું વર્ણન કરો",
    inputSubheading:
      "ગુજરાતી, હિન્દી, મરાઠી, અંગ્રેજી અથવા હિંગ્લિશમાં લખો/બોલો અથવા ફોટો જોડો.",
    clearBtn: "સાફ કરો",
    demoSectionTitle: "કાલ્પનિક પરીક્ષણ દૃશ્યો (ડેમો)",
    loadScenario: "લોડ કરો",
    whatHappenedLabel: "શું થયું છે? (વિશ્લેષણ પહેલાં તપાસો)",
    inputPlaceholder:
      "ઉદાહરણ: એપાર્ટમેન્ટના બેઝમેન્ટમાં પાણી ભરાઈ ગયું છે અને ઇલેક્ટ્રિક મીટરમાંથી તણખા નીકળે છે...",
    locationLabel: "સ્થળ અથવા લેન્ડમાર્ક (વૈકલ્પિક)",
    locationPlaceholder: "શેરી, બિલ્ડિંગનું નામ, માળ અથવા હાઇવે લેન્ડમાર્ક લખો...",
    shareLocationBtn: "મારું લોકેશન શેર કરો",
    locationSharedBtn: "લોકેશન જોડાયું",
    attachPhotoBtn: "ઘટનાનો ફોટો જોડો (વૈકલ્પિક)",
    photoReadyLabel: "ફોટો તૈયાર છે",
    photoUncertaintyNote: "ફોટોના AI અવલોકનમાં અનિશ્ચિતતા હોઈ શકે છે.",
    analyzeBtn: "Gemini થી વિશ્લેષણ કરો",
    analyzingBtn: "Gemini વિશ્લેષણ કરી રહ્યું છે...",
    immediateDangerNote: "તાત્કાલિક જોખમમાં છો? AI ની રાહ ન જુઓ.",

    voiceReady: "બોલીને લખો",
    voiceRequesting: "માઇક પરવાનગી...",
    voiceListening: "સાંભળી રહ્યું છે... હવે બોલો",
    voiceStop: "રોકો",
    voiceTranscribed: "અવાજ લખાણમાં ઉમેરાયો",
    voicePermissionDenied:
      "માઇક્રોફોન પરવાનગી નકારવામાં આવી. કૃપા કરીને પરવાનગી આપો અથવા નીચે ટાઇપ કરો.",
    voiceFailed: "અવાજ સ્પષ્ટ સંભળાયો નહીં. ફરી પ્રયાસ કરો અથવા નીચે ટાઇપ કરો.",
    voiceUnsupported:
      "આ બ્રાઉઝરમાં વૉઇસ ઇનપુટ ઉપલબ્ધ નથી. કૃપા કરીને નીચે ટાઇપ કરો.",

    uncertaintyBanner:
      "આપેલી વિગતોના આધારે; આ ઘટનાની સ્વતંત્ર રીતે ખરાઈ થયેલ નથી.",
    urgencyAdvisoryNote: "સલાહકાર મૂલ્યાંકન — પ્રમાણિત મેડિકલ ટ્રાયેજ નથી",
    urgencyLabels: {
      CRITICAL: "અતિ ગંભીર (Critical)",
      HIGH: "ઉચ્ચ (High)",
      MODERATE: "મધ્યમ (Moderate)",
      LOW: "ઓછું (Low)",
      UNCERTAIN: "અનિશ્ચિત (Uncertain)",
      NON_EMERGENCY: "કોઈ કટોકટી નથી",
    },
    whatToDoNowHeading: "અત્યારે તરત શું કરવું",
    copyBriefBtn: "અહેવાલ કોપી કરો",
    copiedBriefBtn: "કોપી થઈ ગયું",
    shareSmsBtn: "SMS તૈયાર કરો",
    shareWhatsappBtn: "WhatsApp શેર",
    quickViewTab: "ઝડપી દૃશ્ય (તાત્કાલિક પગલાં)",
    detailedViewTab: "વિગતવાર દૃશ્ય (પુરાવા અને સ્રોત)",

    summaryAndLocationHeading: "ઘટનાનો સારાંશ અને કારણ",
    evidenceMatrixHeading: "પુરાવા અને અનિશ્ચિતતા કોષ્ટક",
    reportedInfoCol: "જણાવેલી માહિતી",
    reportedInfoSub: "વપરાશકર્તા દ્વારા સીધી જણાવેલી વિગતો",
    aiRisksCol: "AI દ્વારા ઓળખાયેલા જોખમો",
    aiRisksSub: "સંભવિત અનુમાનો — પુષ્ટિ થયેલ હકીકત નથી",
    missingInfoCol: "ખૂટતી માહિતી",
    missingInfoSub: "મહત્વપૂર્ણ અનુત્તરિત પ્રશ્નો",
    evidenceTraceHeading: "પુરાવાનો સ્રોત તપાસો",
    correctionHeading: "વિગતો સુધારો અથવા ઉમેરો",
    correctionPlaceholder:
      'ઉદાહરણ: "તેઓ બીજા માળે છે, બેઝમેન્ટમાં નહીં."',
    updateAnalysisBtn: "વિશ્લેષણ અપડેટ કરો",
    updatingAnalysisBtn: "અપડેટ થઈ રહ્યું છે...",
    warningsHeading: "સુરક્ષા ચેતવણીઓ (આ ન કરો)",
    editableBriefHeading: "112 કટોકટી સંક્ષિપ્ત અહેવાલ",
    nonDispatchDisclaimer:
      "SMS અથવા WhatsApp તૈયાર કરવાથી 112 સેવા આપમેળે મોકલવામાં આવતી નથી. સત્તાવાર મદદ માટે 112 પર કૉલ કરો.",

    readyTitle: "વિશ્લેષણ માટે તૈયાર",
    readyDescription:
      "ડાબી બાજુથી એક ડેમો દૃશ્ય પસંદ કરો અથવા તમારી પરિસ્થિતિ લખો જેથી તાત્કાલિક સુરક્ષા પગલાં મળી શકે.",
    historyHeading: "સત્ર ઇતિહાસ",
    historyEmpty: "આ સત્રમાં હજુ સુધી કોઈ વિશ્લેષણ કરવામાં આવ્યું નથી.",
    newAnalysisBtn: "+ નવું વિશ્લેષણ",
  },
};
