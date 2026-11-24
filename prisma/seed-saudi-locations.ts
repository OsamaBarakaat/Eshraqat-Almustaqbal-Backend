import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface DistrictData {
  ar: string;
  en: string;
}

interface CityData {
  ar: string;
  en: string;
  districts: DistrictData[];
}

interface ProvinceData {
  ar: string;
  en: string;
  sortOrder: number;
  cities: CityData[];
}

const SAUDI_LOCATIONS: ProvinceData[] = [
  // 1. الرياض
  {
    ar: "منطقة الرياض",
    en: "Riyadh Province",
    sortOrder: 1,
    cities: [
      {
        ar: "مدينة الرياض",
        en: "Riyadh City",
        districts: [
          { ar: "حي النرجس", en: "An Narjis" },
          { ar: "حي الياسمين", en: "Al Yasmin" },
          { ar: "حي الملقا", en: "Al Malqa" },
          { ar: "حي حطين", en: "Hittin" },
          { ar: "حي العليا", en: "Al Olaya" },
          { ar: "حي الصحافة", en: "As Sahafah" },
          { ar: "حي العارض", en: "Al Arid" },
          { ar: "حي الرمال", en: "Ar Rimal" },
          { ar: "حي القيروان", en: "Al Qayrawan" },
          { ar: "حي العقيق", en: "Al Aqiq" },
          { ar: "حي السليمانية", en: "As Sulimaniyah" },
          { ar: "حي الروضة", en: "Ar Rawdah" },
          { ar: "حي قرطبة", en: "Qurtubah" },
          { ar: "حي المونسية", en: "Al Munsiyah" },
          { ar: "حي اليرموك", en: "Al Yarmuk" },
          { ar: "حي النزهة", en: "An Nuzhah" },
          { ar: "حي الربيع", en: "Ar Rabi" },
          { ar: "حي التعاون", en: "At Taawun" },
          { ar: "حي طويق", en: "Tuwaiq" },
          { ar: "حي ظهرة لبن", en: "Dhahrat Laban" },
          { ar: "حي الشفا", en: "Ash Shifa" },
          { ar: "حي السويدي", en: "As Suwaidi" },
          { ar: "حي النسيم", en: "An Naseem" },
          { ar: "حي الحمراء", en: "Al Hamra" },
        ],
      },
      {
        ar: "الخرج",
        en: "Al-Kharj",
        districts: [
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
          { ar: "حي الأندلس", en: "Al Andalus" },
          { ar: "حي الورود", en: "Al Wurud" },
          { ar: "حي السلام", en: "As Salam" },
          { ar: "حي غرناطة", en: "Gharnatah" },
        ],
      },
      {
        ar: "الدرعية",
        en: "Diriyah",
        districts: [
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
          { ar: "حي الفيصلية", en: "Al Faisaliyah" },
          { ar: "حي جاكس", en: "JAX" },
          { ar: "حي ظهرة العودة", en: "Dhahrat Al Owdah" },
        ],
      },
      {
        ar: "المجمعة",
        en: "Al Majma'ah",
        districts: [
          { ar: "حي الفيحاء", en: "Al Fayha" },
          { ar: "حي اليرموك", en: "Al Yarmuk" },
          { ar: "حي الروضة", en: "Ar Rawdah" },
        ],
      },
      {
        ar: "الدوادمي",
        en: "Al Duwadimi",
        districts: [
          { ar: "حي الدرعية", en: "Al Diriyah" },
          { ar: "حي القدس", en: "Al Quds" },
          { ar: "حي الخليج", en: "Al Khaleej" },
        ],
      },
      {
        ar: "وادي الدواسر",
        en: "Wadi ad-Dawasir",
        districts: [
          { ar: "حي الخماسين", en: "Al Khamasin" },
          { ar: "حي النويعمة", en: "An Nuwayimah" },
          { ar: "حي اللدام", en: "Al Lidam" },
        ],
      },
      {
        ar: "المزاحمية",
        en: "Al-Muzahmiyya",
        districts: [
          { ar: "حي نوارة", en: "Nuwarah" },
          { ar: "حي شخيب", en: "Shukhaib" },
          { ar: "حي الغطغط", en: "Al Ghutghut" },
        ],
      },
      {
        ar: "الزلفي",
        en: "Az Zulfi",
        districts: [
          { ar: "حي الصديق", en: "As Siddiq" },
          { ar: "حي اليمامة", en: "Al Yamamah" },
          { ar: "حي الفاروق", en: "Al Faruq" },
        ],
      },
      {
        ar: "شقراء",
        en: "Shaqra",
        districts: [
          { ar: "حي الروضة", en: "Ar Rawdah" },
          { ar: "حي التأهيل", en: "Al Taheel" },
        ],
      },
      {
        ar: "حوطة بني تميم",
        en: "Hawtat Bani Tamim",
        districts: [
          { ar: "حي السلام", en: "As Salam" },
          { ar: "حي الحلوة", en: "Al Hilwah" },
        ],
      },
    ],
  },

  // 2. مكة المكرمة
  {
    ar: "منطقة مكة المكرمة",
    en: "Makkah Province",
    sortOrder: 2,
    cities: [
      {
        ar: "مكة المكرمة",
        en: "Makkah",
        districts: [
          { ar: "حي العوالي", en: "Al Awali" },
          { ar: "حي الشوقية", en: "Ash Shawqiyyah" },
          { ar: "حي بطحاء قريش", en: "Batha Quraysh" },
          { ar: "حي العزيزية", en: "Al Aziziyah" },
          { ar: "حي النوارية", en: "An Nawwariyyah" },
          { ar: "حي الزاهر", en: "Az Zahir" },
          { ar: "حي الرصيفة", en: "Ar Rusayfah" },
          { ar: "حي الشرائع", en: "Ash Sharai" },
          { ar: "حي النسيم", en: "An Naseem" },
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
        ],
      },
      {
        ar: "مدينة جدة",
        en: "Jeddah City",
        districts: [
          { ar: "حي الشاطئ", en: "Al Shati" },
          { ar: "حي أبحر الشمالية", en: "North Obhur" },
          { ar: "حي أبحر الجنوبية", en: "South Obhur" },
          { ar: "حي الحمراء", en: "Al Hamra" },
          { ar: "حي الروضة", en: "Al Rawdah" },
          { ar: "حي السلامة", en: "Al Salamah" },
          { ar: "حي الزهراء", en: "Al Zahra" },
          { ar: "حي النعيم", en: "Al Naeem" },
          { ar: "حي المرجان", en: "Al Murjan" },
          { ar: "حي البساتين", en: "Al Basateen" },
          { ar: "حي المحمدية", en: "Al Mohammedia" },
          { ar: "حي الصفا", en: "Al Safa" },
          { ar: "حي الفيصلية", en: "Al Faisaliyah" },
          { ar: "حي النسيم", en: "Al Naseem" },
          { ar: "حي المروة", en: "Al Marwah" },
          { ar: "حي الياقوت", en: "Al Yaqoot" },
          { ar: "حي السامر", en: "Al Samer" },
          { ar: "حي طيبة", en: "Taybah" },
        ],
      },
      {
        ar: "الطائف",
        en: "Taif",
        districts: [
          { ar: "حي الشفا", en: "Ash Shafa" },
          { ar: "حي الهدا", en: "Al Hada" },
          { ar: "حي الحوية", en: "Al Hawiyah" },
          { ar: "حي شهار", en: "Shehar" },
          { ar: "حي الفيصلية", en: "Al Faisaliyah" },
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
          { ar: "حي الوسام", en: "Al Wessam" },
        ],
      },
      {
        ar: "رابغ",
        en: "Rabigh",
        districts: [
          { ar: "حي المرجانية", en: "Al Marjaniyah" },
          { ar: "حي الصفا", en: "Al Safa" },
          { ar: "حي الفرع", en: "Al Fara" },
        ],
      },
      {
        ar: "القنفذة",
        en: "Al Qunfudhah",
        districts: [
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
          { ar: "حي الشاطئ", en: "Al Shati" },
          { ar: "حي الشرقية", en: "Ash Sharqiyah" },
        ],
      },
      {
        ar: "الليث",
        en: "Al Lith",
        districts: [
          { ar: "حي العزيزية", en: "Al Aziziyah" },
          { ar: "حي الكورنيش", en: "Al Corniche" },
        ],
      },
      {
        ar: "خليص",
        en: "Khulais",
        districts: [
          { ar: "حي غران", en: "Gharan" },
          { ar: "حي الدف", en: "Ad Doff" },
        ],
      },
    ],
  },

  // 3. المنطقة الشرقية
  {
    ar: "المنطقة الشرقية",
    en: "Eastern Province",
    sortOrder: 3,
    cities: [
      {
        ar: "مدينة الدمام",
        en: "Dammam City",
        districts: [
          { ar: "حي الشاطئ", en: "Ash Shati" },
          { ar: "حي الفاخرية", en: "Al Fakhriyah" },
          { ar: "حي المزروعية", en: "Al Mazruiyah" },
          { ar: "حي طيبة", en: "Taybah" },
          { ar: "حي المنار", en: "Al Manar" },
          { ar: "حي الفيصلية", en: "Al Faisaliyah" },
          { ar: "حي النورس", en: "An Nawras" },
          { ar: "حي الفردوس", en: "Al Fardaws" },
          { ar: "حي ضاحية الملك فهد", en: "King Fahd Suburb" },
          { ar: "حي الندى", en: "An Nada" },
          { ar: "حي غرناطة", en: "Gharnatah" },
        ],
      },
      {
        ar: "مدينة الخبر",
        en: "Khobar City",
        districts: [
          { ar: "حي الحزام الذهبي", en: "Al Hizam Al Thahabi" },
          { ar: "حي الحزام الأخضر", en: "Al Hizam Al Akhdar" },
          { ar: "حي الراكة الجنوبية", en: "South Rakah" },
          { ar: "حي الكورنيش", en: "Al Corniche" },
          { ar: "حي العليا", en: "Al Olaya" },
          { ar: "حي الدوحة", en: "Ad Dawhah" },
          { ar: "حي العزيزية", en: "Al Aziziyah" },
          { ar: "حي الجسر", en: "Al Jisr" },
          { ar: "حي الخزامى", en: "Al Khuzama" },
          { ar: "حي العقربية", en: "Al Aqrabiyah" },
          { ar: "حي الصواري", en: "Al Sawari" },
        ],
      },
      {
        ar: "الظهران",
        en: "Dhahran",
        districts: [
          { ar: "حي الدوحة الشمالية", en: "North Dawhah" },
          { ar: "حي القصور", en: "Al Qusoor" },
          { ar: "حي الجامعة", en: "Al Jamiah" },
          { ar: "حي دانة الرامس", en: "Danat Al Ramis" },
        ],
      },
      {
        ar: "الأحساء",
        en: "Al Ahsa",
        districts: [
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
          { ar: "حي المزروع", en: "Al Mazru" },
          { ar: "حي الراشدية", en: "Al Rashdiyah" },
          { ar: "حي الفيصلية", en: "Al Faisaliyah" },
          { ar: "حي السلمانية", en: "As Sulaimaniyah" },
          { ar: "حي محاسن", en: "Mahasin" },
          { ar: "حي عين نجم", en: "Ain Najm" },
        ],
      },
      {
        ar: "الجبيل",
        en: "Jubail",
        districts: [
          { ar: "حي الفردوس", en: "Al Fardaws" },
          { ar: "حي الفيحاء", en: "Al Fayha" },
          { ar: "حي نجد", en: "Najd" },
          { ar: "حي الدانة", en: "Al Danah" },
          { ar: "حي الحويلات", en: "Al Huwailat" },
          { ar: "حي جلمودة", en: "Jalmudah" },
          { ar: "حي دارين", en: "Dareen" },
        ],
      },
      {
        ar: "القطيف",
        en: "Qatif",
        districts: [
          { ar: "حي سيهات", en: "Saihat" },
          { ar: "حي تاروت", en: "Tarout" },
          { ar: "حي عنك", en: "Inak" },
          { ar: "حي المجيدية", en: "Al Majeediyah" },
          { ar: "حي الشاطئ", en: "Ash Shati" },
          { ar: "حي الناصرة", en: "An Nasiriyah" },
        ],
      },
      {
        ar: "حفر الباطن",
        en: "Hafar Al Batin",
        districts: [
          { ar: "حي البلدية", en: "Al Baladiyah" },
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
          { ar: "حي الرابية", en: "Al Rabiyah" },
          { ar: "حي التلال", en: "Al Tilal" },
          { ar: "حي الربوة", en: "Al Rabwah" },
        ],
      },
      {
        ar: "الخفجي",
        en: "Khafji",
        districts: [
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
          { ar: "حي العزيزية", en: "Al Aziziyah" },
          { ar: "حي الفيصلية", en: "Al Faisaliyah" },
        ],
      },
      {
        ar: "رأس تنورة",
        en: "Ras Tanura",
        districts: [
          { ar: "حي الدانة", en: "Al Danah" },
          { ar: "حي النرجس", en: "An Narjis" },
          { ar: "حي الفيحاء", en: "Al Fayha" },
        ],
      },
    ],
  },

  // 4. المدينة المنورة
  {
    ar: "منطقة المدينة المنورة",
    en: "Madinah Province",
    sortOrder: 4,
    cities: [
      {
        ar: "المدينة المنورة",
        en: "Madinah",
        districts: [
          { ar: "حي العريض", en: "Al Uraydh" },
          { ar: "حي مذينب", en: "Muthinab" },
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
          { ar: "حي الرانوناء", en: "Ar Ranuna" },
          { ar: "حي قباء", en: "Quba" },
          { ar: "حي السلام", en: "As Salam" },
          { ar: "حي الدفاع", en: "Ad Difa" },
          { ar: "حي القصواء", en: "Al Qaswa" },
          { ar: "حي شوران", en: "Shawran" },
          { ar: "حي العزيزية", en: "Al Aziziyah" },
        ],
      },
      {
        ar: "ينبع",
        en: "Yanbu",
        districts: [
          { ar: "حي ينبع البحر", en: "Yanbu Al Bahr" },
          { ar: "حي ينبع الصناعية", en: "Yanbu Al Sinaiyah" },
          { ar: "حي الشاطئ", en: "Ash Shati" },
          { ar: "حي السميري", en: "Al Samiri" },
          { ar: "حي الصريف", en: "Al Sareef" },
        ],
      },
      {
        ar: "العلا",
        en: "AlUla",
        districts: [
          { ar: "حي الصخيرات", en: "Al Sakhayrat" },
          { ar: "حي المنشية", en: "Al Manshiyah" },
          { ar: "حي العزيزية", en: "Al Aziziyah" },
        ],
      },
      {
        ar: "بدر",
        en: "Badr",
        districts: [
          { ar: "حي الغزوة", en: "Al Ghazwah" },
          { ar: "حي السلام", en: "As Salam" },
        ],
      },
    ],
  },

  // 5. القصيم
  {
    ar: "منطقة القصيم",
    en: "Qassim Province",
    sortOrder: 5,
    cities: [
      {
        ar: "بريدة",
        en: "Buraidah",
        districts: [
          { ar: "حي الإسكان", en: "Al Iskan" },
          { ar: "حي الصفراء", en: "Al Safra" },
          { ar: "حي المنتزه", en: "Al Muntazah" },
          { ar: "حي الريان", en: "Al Rayyan" },
          { ar: "حي النهضة", en: "An Nahdah" },
          { ar: "حي الفايزية", en: "Al Fayziyah" },
          { ar: "حي الضاحي", en: "Ad Dahi" },
        ],
      },
      {
        ar: "عنيزة",
        en: "Unaizah",
        districts: [
          { ar: "حي الفاخرية", en: "Al Fakhriyah" },
          { ar: "حي المروة", en: "Al Marwah" },
          { ar: "حي الأشرفية", en: "Al Ashrafiyah" },
          { ar: "حي القادسية", en: "Al Qadisiyah" },
          { ar: "حي الريان", en: "Al Rayyan" },
        ],
      },
      {
        ar: "الرس",
        en: "Ar Rass",
        districts: [
          { ar: "حي الحزم", en: "Al Hazm" },
          { ar: "حي الروضة", en: "Ar Rawdah" },
          { ar: "حي اليرموك", en: "Al Yarmuk" },
        ],
      },
      {
        ar: "البكيرية",
        en: "Al Bukayriyah",
        districts: [
          { ar: "حي النهضة", en: "An Nahdah" },
          { ar: "حي الربوة", en: "Al Rabwah" },
        ],
      },
      {
        ar: "المذنب",
        en: "Al Midhnab",
        districts: [
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
          { ar: "حي الصالحية", en: "As Salihiyah" },
        ],
      },
    ],
  },

  // 6. عسير
  {
    ar: "منطقة عسير",
    en: "Asir Province",
    sortOrder: 6,
    cities: [
      {
        ar: "أبها",
        en: "Abha",
        districts: [
          { ar: "حي المفتاحة", en: "Al Muftaha" },
          { ar: "حي المنسك", en: "Al Mansak" },
          { ar: "حي الضباب", en: "Ad Dabab" },
          { ar: "حي الموظفين", en: "Al Muwazzafeen" },
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
          { ar: "حي الورود", en: "Al Wurud" },
          { ar: "حي السد", en: "As Sadd" },
        ],
      },
      {
        ar: "خميس مشيط",
        en: "Khamis Mushait",
        districts: [
          { ar: "حي الموسى", en: "Al Mousa" },
          { ar: "حي الرصراص", en: "Ar Rasras" },
          { ar: "حي حسام", en: "Husam" },
          { ar: "حي الصقور", en: "Al Suqoor" },
          { ar: "حي أم سرار", en: "Umm Sarar" },
        ],
      },
      {
        ar: "محايل عسير",
        en: "Muhayil",
        districts: [
          { ar: "حي الحيلة", en: "Al Heelah" },
          { ar: "حي الضرس", en: "Ad Dirs" },
          { ar: "حي النزهة", en: "An Nuzhah" },
        ],
      },
      {
        ar: "بيشة",
        en: "Bisha",
        districts: [
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
          { ar: "حي الفهد", en: "Al Fahad" },
          { ar: "حي الخزامى", en: "Al Khuzama" },
        ],
      },
      {
        ar: "أحد رفيدة",
        en: "Ahad Rafidah",
        districts: [
          { ar: "حي السلام", en: "As Salam" },
          { ar: "حي العزيزية", en: "Al Aziziyah" },
        ],
      },
      {
        ar: "النماص",
        en: "Al Namas",
        districts: [
          { ar: "حي السلام", en: "As Salam" },
          { ar: "حي النزهة", en: "An Nuzhah" },
        ],
      },
    ],
  },

  // 7. تبوك
  {
    ar: "منطقة تبوك",
    en: "Tabuk Province",
    sortOrder: 7,
    cities: [
      {
        ar: "تبوك",
        en: "Tabuk",
        districts: [
          { ar: "حي العليا", en: "Al Olaya" },
          { ar: "حي المروج", en: "Al Muruj" },
          { ar: "حي الورود", en: "Al Wurud" },
          { ar: "حي السعادة", en: "As Saadah" },
          { ar: "حي النهضة", en: "An Nahdah" },
          { ar: "حي الحمراء", en: "Al Hamra" },
        ],
      },
      {
        ar: "ضباء",
        en: "Duba",
        districts: [
          { ar: "حي الساحل", en: "As Sahil" },
          { ar: "حي المقيطع", en: "Al Muqayti" },
        ],
      },
      {
        ar: "أملج",
        en: "Umluj",
        districts: [
          { ar: "حي الروضة", en: "Ar Rawdah" },
          { ar: "حي المرجان", en: "Al Murjan" },
        ],
      },
      {
        ar: "الوجه",
        en: "Al Wajh",
        districts: [
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
          { ar: "حي المنشية", en: "Al Manshiyah" },
        ],
      },
    ],
  },

  // 8. حائل
  {
    ar: "منطقة حائل",
    en: "Hail Province",
    sortOrder: 8,
    cities: [
      {
        ar: "حائل",
        en: "Hail",
        districts: [
          { ar: "حي النقرة", en: "An Nuqrah" },
          { ar: "حي الوسيطاء", en: "Al Wasita" },
          { ar: "حي صديان", en: "Sadyan" },
          { ar: "حي الجامعيين", en: "Al Jamiyyin" },
          { ar: "حي الخزامى", en: "Al Khuzama" },
          { ar: "حي أجا", en: "Aja" },
        ],
      },
      {
        ar: "بقعاء",
        en: "Baq'aa",
        districts: [
          { ar: "حي اللويش", en: "Al Luwaysh" },
          { ar: "حي الصالحية", en: "As Salihiyah" },
        ],
      },
    ],
  },

  // 9. جازان
  {
    ar: "منطقة جازان",
    en: "Jazan Province",
    sortOrder: 9,
    cities: [
      {
        ar: "جازان",
        en: "Jazan",
        districts: [
          { ar: "حي الشاطئ", en: "Ash Shati" },
          { ar: "حي الصفا", en: "Al Safa" },
          { ar: "حي الروضة", en: "Ar Rawdah" },
          { ar: "حي السويس", en: "As Suways" },
          { ar: "حي المرجان", en: "Al Murjan" },
        ],
      },
      {
        ar: "صبيا",
        en: "Sabya",
        districts: [
          { ar: "حي الظبية", en: "Adh Dhabiyah" },
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
        ],
      },
      {
        ar: "أبو عريش",
        en: "Abu Arish",
        districts: [
          { ar: "حي الروضة", en: "Ar Rawdah" },
          { ar: "حي المروج", en: "Al Muruj" },
        ],
      },
      {
        ar: "صامطة",
        en: "Samtah",
        districts: [
          { ar: "حي الخضراء", en: "Al Khadra" },
          { ar: "حي الشرق", en: "Ash Sharq" },
        ],
      },
    ],
  },

  // 10. نجران
  {
    ar: "منطقة نجران",
    en: "Najran Province",
    sortOrder: 10,
    cities: [
      {
        ar: "نجران",
        en: "Najran",
        districts: [
          { ar: "حي الفهد", en: "Al Fahad" },
          { ar: "حي الخالدية", en: "Al Khalidiyah" },
          { ar: "حي أبا السعود", en: "Aba As Suood" },
          { ar: "حي العريسة", en: "Al Areesah" },
          { ar: "حي الغويلا", en: "Al Ghuwayla" },
        ],
      },
      {
        ar: "شرورة",
        en: "Sharurah",
        districts: [
          { ar: "حي الروضة", en: "Ar Rawdah" },
          { ar: "حي الفيصلية", en: "Al Faisaliyah" },
        ],
      },
    ],
  },

  // 11. الباحة
  {
    ar: "منطقة الباحة",
    en: "Al Bahah Province",
    sortOrder: 11,
    cities: [
      {
        ar: "الباحة",
        en: "Al Bahah",
        districts: [
          { ar: "حي الظفير", en: "Adh Dhafeer" },
          { ar: "حي رغدان", en: "Raghadan" },
          { ar: "حي الحاوية", en: "Al Hawiyah" },
          { ar: "حي الزرقاء", en: "Az Zarqa" },
        ],
      },
      {
        ar: "بلجرشي",
        en: "Baljurashi",
        districts: [
          { ar: "حي الفيصلية", en: "Al Faisaliyah" },
          { ar: "حي الربوة", en: "Al Rabwah" },
        ],
      },
    ],
  },

  // 12. الجوف
  {
    ar: "منطقة الجوف",
    en: "Al Jawf Province",
    sortOrder: 12,
    cities: [
      {
        ar: "سكاكا",
        en: "Sakaka",
        districts: [
          { ar: "حي العزيزية", en: "Al Aziziyah" },
          { ar: "حي الصالحية", en: "As Salihiyah" },
          { ar: "حي اللقائط", en: "Al Laqayit" },
          { ar: "حي الربوة", en: "Al Rabwah" },
          { ar: "حي الشلهوب", en: "Ash Shalhoub" },
        ],
      },
      {
        ar: "القريات",
        en: "Al Qurayyat",
        districts: [
          { ar: "حي المطار", en: "Al Matar" },
          { ar: "حي اليرموك", en: "Al Yarmuk" },
          { ar: "حي الفيصلية", en: "Al Faisaliyah" },
        ],
      },
      {
        ar: "دومة الجندل",
        en: "Dumat Al Jandal",
        districts: [
          { ar: "حي الدلهمية", en: "Ad Dalhamiyah" },
          { ar: "حي الرويسات", en: "Ar Ruwaysat" },
        ],
      },
    ],
  },

  // 13. الحدود الشمالية
  {
    ar: "منطقة الحدود الشمالية",
    en: "Northern Borders Province",
    sortOrder: 13,
    cities: [
      {
        ar: "عرعر",
        en: "Arar",
        districts: [
          { ar: "حي المحمدية", en: "Al Mohammedia" },
          { ar: "حي الصالحية", en: "As Salihiyah" },
          { ar: "حي المساعدية", en: "Al Musaidiyah" },
          { ar: "حي المنصورية", en: "Al Mansouriyah" },
          { ar: "حي الفيصلية", en: "Al Faisaliyah" },
        ],
      },
      {
        ar: "طريف",
        en: "Turaif",
        districts: [
          { ar: "حي العزيزية", en: "Al Aziziyah" },
          { ar: "حي الصفا", en: "Al Safa" },
          { ar: "حي الورود", en: "Al Wurud" },
        ],
      },
      {
        ar: "رفحاء",
        en: "Rafha",
        districts: [
          { ar: "حي اليرموك", en: "Al Yarmuk" },
          { ar: "حي الروضة", en: "Ar Rawdah" },
        ],
      },
    ],
  },
];

async function seedSaudiLocations() {
  console.log("🇸🇦 Starting comprehensive Saudi Arabia geographic hierarchy seed...");

  let totalProvinces = 0;
  let totalCities = 0;
  let totalDistricts = 0;

  for (const provData of SAUDI_LOCATIONS) {
    const province = await prisma.province.upsert({
      where: { nameArabic: provData.ar },
      update: {
        nameEnglish: provData.en,
        sortOrder: provData.sortOrder,
        enabled: true,
      },
      create: {
        nameArabic: provData.ar,
        nameEnglish: provData.en,
        sortOrder: provData.sortOrder,
        country: "المملكة العربية السعودية",
        enabled: true,
      },
    });
    totalProvinces++;

    for (let cIdx = 0; cIdx < provData.cities.length; cIdx++) {
      const cityData = provData.cities[cIdx];
      const city = await prisma.city.upsert({
        where: {
          provinceId_nameArabic: {
            provinceId: province.id,
            nameArabic: cityData.ar,
          },
        },
        update: {
          nameEnglish: cityData.en,
          sortOrder: cIdx + 1,
          enabled: true,
        },
        create: {
          provinceId: province.id,
          nameArabic: cityData.ar,
          nameEnglish: cityData.en,
          sortOrder: cIdx + 1,
          enabled: true,
        },
      });
      totalCities++;

      for (let dIdx = 0; dIdx < cityData.districts.length; dIdx++) {
        const distData = cityData.districts[dIdx];
        await prisma.district.upsert({
          where: {
            cityId_nameArabic: {
              cityId: city.id,
              nameArabic: distData.ar,
            },
          },
          update: {
            nameEnglish: distData.en,
            sortOrder: dIdx + 1,
            enabled: true,
          },
          create: {
            cityId: city.id,
            nameArabic: distData.ar,
            nameEnglish: distData.en,
            sortOrder: dIdx + 1,
            enabled: true,
          },
        });
        totalDistricts++;
      }
    }
  }

  console.log(`✅ Completed Saudi Locations Seeding:`);
  console.log(`   - 🏛️ Provinces: ${totalProvinces}`);
  console.log(`   - 🏙️ Cities: ${totalCities}`);
  console.log(`   - 📍 Districts: ${totalDistricts}`);
}

seedSaudiLocations()
  .catch((e) => {
    console.error("❌ Error seeding locations:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
