export type SafetyZone = {
  name: string;
  level: "safe" | "moderate" | "caution";
  summary: string;
};

export type HousingListing = {
  id: string;
  emoji: string;
  price: string;
  title: string;
  location: string;
  tags: string[];
};

export type FoodPlace = {
  id: string;
  type: "chilean" | "cafe" | "international" | "vegetarian";
  emoji: string;
  rating: string;
  name: string;
  location: string;
  price: string;
  description: string;
};

export type CommunityGroup = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  members: string;
};

export type ChatMessage = {
  id: string;
  author: string;
  initials: string;
  text: string;
  time: string;
  self?: boolean;
};

export const useGuideData = () => {
  const stats = [
    { value: "32k+", label: "Expats helped" },
    { value: "18", label: "Regions covered" },
    { value: "240+", label: "Vetted listings" },
    { value: "4.9★", label: "Community rating" },
  ];

  const safetyZones: SafetyZone[] = [
    {
      name: "Providencia",
      level: "safe",
      summary: "Great walkability, parks, and public transit.",
    },
    {
      name: "Las Condes",
      level: "safe",
      summary: "Upscale, low crime, and strong infrastructure.",
    },
    {
      name: "Nunoa",
      level: "safe",
      summary: "Artsy, young-professional, and cafe-rich district.",
    },
    {
      name: "Santiago Centro",
      level: "moderate",
      summary: "Fine in daytime, stay alert at night.",
    },
    {
      name: "San Miguel",
      level: "moderate",
      summary: "Affordable and practical, caution after dark.",
    },
    {
      name: "La Pintana",
      level: "caution",
      summary: "Higher risk area, daytime visits recommended.",
    },
  ];

  const housingListings: HousingListing[] = [
    {
      id: "h1",
      emoji: "🏢",
      price: "CLP 650,000/mo",
      title: "Studio in Providencia",
      location: "Av. Providencia · Metro Baquedano",
      tags: ["Furnished", "Pet OK", "Metro 5min"],
    },
    {
      id: "h2",
      emoji: "🏡",
      price: "CLP 950,000/mo",
      title: "2BR Apartment in Nunoa",
      location: "Irarrazaval · Plaza Nunoa",
      tags: ["Full kitchen", "Laundry", "Quiet street"],
    },
    {
      id: "h3",
      emoji: "🛋️",
      price: "CLP 400,000/mo",
      title: "Shared Room · Las Condes",
      location: "El Golf · Costanera",
      tags: ["Bills incl.", "Bilingual house", "Expat friendly"],
    },
    {
      id: "h4",
      emoji: "🌿",
      price: "CLP 1,200,000/mo",
      title: "Modern 3BR · Vitacura",
      location: "Av. Vitacura · Parque Araucano",
      tags: ["Parking", "Pool", "24hr security"],
    },
    {
      id: "h5",
      emoji: "🏠",
      price: "CLP 500,000/mo",
      title: "Cozy 1BR · Barrio Italia",
      location: "Av. Italia · Parque Bustamante",
      tags: ["Furnished", "Cafes nearby", "Trendy area"],
    },
    {
      id: "h6",
      emoji: "🏗️",
      price: "CLP 780,000/mo",
      title: "New Build · San Bernardo",
      location: "Serrano · Near Metro Sur",
      tags: ["New building", "Gym", "Affordable"],
    },
  ];

  const checklist = [
    "Get your RUT (tax ID)",
    "Open a bank account",
    "Register at your municipality",
    "Enroll in FONASA",
    "Register your AFP",
    "Get your Chilean ID card",
  ];

  const timeline = [
    {
      when: "Day 1",
      step: "Tourist Entry (90 days)",
      note: "Enter Chile and start your local setup.",
    },
    {
      when: "Week 1–4",
      step: "Apply temporary residency",
      note: "Submit your digital visa file with key docs.",
    },
    {
      when: "Month 2–6",
      step: "Wait + provisional RUT",
      note: "Track responses and keep docs ready.",
    },
    {
      when: "Year 1–2",
      step: "Temporary residence",
      note: "Work legally, renew, and keep records.",
    },
    {
      when: "Year 2+",
      step: "Permanent residency",
      note: "Apply for long-term status with full rights.",
    },
  ];

  const foodPlaces: FoodPlace[] = [
    {
      id: "f1",
      type: "chilean",
      emoji: "🥟",
      rating: "4.8",
      name: "El Hoyo",
      location: "Santiago Centro",
      price: "~CLP 5,000",
      description: "Classic completos and empanadas with local flair.",
    },
    {
      id: "f2",
      type: "chilean",
      emoji: "🍖",
      rating: "4.7",
      name: "La Piojera",
      location: "Barrio Yungay",
      price: "~CLP 8,000",
      description: "Historic parrillada and terremoto atmosphere.",
    },
    {
      id: "f3",
      type: "cafe",
      emoji: "☕",
      rating: "4.9",
      name: "Cafe Quinoa",
      location: "Providencia",
      price: "~CLP 4,500",
      description: "Remote-work friendly cafe with great cortado.",
    },
    {
      id: "f4",
      type: "international",
      emoji: "🍜",
      rating: "4.6",
      name: "Hanzo Ramen",
      location: "Nunoa",
      price: "~CLP 9,500",
      description: "Solid ramen stop popular with expats.",
    },
    {
      id: "f5",
      type: "vegetarian",
      emoji: "🥗",
      rating: "4.7",
      name: "Verde Organico",
      location: "Barrio Italia",
      price: "~CLP 7,000",
      description: "Seasonal veggie menus and strong lunch value.",
    },
    {
      id: "f6",
      type: "international",
      emoji: "🥙",
      rating: "4.5",
      name: "Al-Amir Shawarma",
      location: "Patronato",
      price: "~CLP 5,500",
      description: "Authentic Arab district street food favorite.",
    },
  ];

  const groups: CommunityGroup[] = [
    {
      id: "g1",
      emoji: "🇨🇱",
      name: "Expats in Santiago",
      description: "Main newcomer hub in English and Spanish.",
      members: "8.4k members",
    },
    {
      id: "g2",
      emoji: "💼",
      name: "Jobs & Remote Work Chile",
      description: "Work tips, referrals, and openings.",
      members: "3.1k members",
    },
    {
      id: "g3",
      emoji: "🏠",
      name: "Housing + Flatmates",
      description: "Rooms, apartments, and landlord advice.",
      members: "5.2k members",
    },
    {
      id: "g4",
      emoji: "📚",
      name: "Spanish Language Exchange",
      description: "Practice and meet locals weekly.",
      members: "2.6k members",
    },
  ];

  const starterMessages: ChatMessage[] = [
    {
      id: "m1",
      author: "Maria K.",
      initials: "MK",
      text: "RUT got approved after 3 months. Keep your docs tidy and ready.",
      time: "2:14 PM",
    },
    {
      id: "m2",
      author: "James R.",
      initials: "JR",
      text: "Any trusted locksmith near Baquedano?",
      time: "2:18 PM",
    },
    {
      id: "m3",
      author: "Sofia P.",
      initials: "SP",
      text: "Try Cerrajero Express on Av. Providencia, fast and fair prices.",
      time: "2:21 PM",
    },
  ];

  return {
    stats,
    safetyZones,
    housingListings,
    checklist,
    timeline,
    foodPlaces,
    groups,
    starterMessages,
  };
};
