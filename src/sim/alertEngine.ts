import type { AlertItem } from "../types";
import { CLASSIFICATION_META } from "./classificationEngine";
import type { ClassificationLevel, RecommendationAction } from "./types";

/**
 * Bilingual (English/Bangla) alert copy, fanned out across the channel mix a
 * Bangladeshi national emergency broadcast would actually use. Every alert
 * carries both languages in one message, mirroring real EAS/cell-broadcast
 * practice rather than splitting into parallel English-only/Bangla-only feeds.
 */
const CHANNELS_BY_SEVERITY: Record<AlertItem["severity"], string[]> = {
  info: ["Push"],
  low: ["Push"],
  moderate: ["Push", "SMS"],
  high: ["SMS", "Push", "Public Broadcast"],
  critical: ["SMS", "Push", "Siren", "Public Broadcast"],
};

const CLASSIFICATION_COPY: Record<ClassificationLevel, { title: string; en: string; bn: string }> = {
  normal: {
    title: "All systems nominal",
    en: "All monitored systems at Rooppur NPP are nominal.",
    bn: "রূপপুর পারমাণবিক বিদ্যুৎ কেন্দ্রের সকল ব্যবস্থা স্বাভাবিক রয়েছে।",
  },
  alert: {
    title: "Alert declared",
    en: "Minor anomaly detected at Rooppur NPP. No public action required at this time.",
    bn: "রূপপুর পারমাণবিক বিদ্যুৎ কেন্দ্রে সামান্য অস্বাভাবিকতা দেখা দিয়েছে। এই মুহূর্তে জনসাধারণের কোনো পদক্ষেপের প্রয়োজন নেই।",
  },
  facility_emergency: {
    title: "Facility Emergency declared",
    en: "Facility Emergency declared at Rooppur NPP. Stay tuned for further instructions.",
    bn: "রূপপুর পারমাণবিক বিদ্যুৎ কেন্দ্রে স্থাপনা জরুরি অবস্থা ঘোষণা করা হয়েছে। পরবর্তী নির্দেশাবলীর জন্য সংযুক্ত থাকুন।",
  },
  site_area_emergency: {
    title: "Site Area Emergency declared",
    en: "Site Area Emergency declared. Residents within the precautionary zone should prepare to shelter or evacuate on instruction.",
    bn: "সাইট এলাকা জরুরি অবস্থা ঘোষণা করা হয়েছে। সতর্কীকরণ অঞ্চলের বাসিন্দারা নির্দেশ অনুযায়ী আশ্রয় নেওয়া বা সরে যাওয়ার জন্য প্রস্তুত থাকুন।",
  },
  general_emergency: {
    title: "General Emergency declared",
    en: "General Emergency declared at Rooppur NPP. Follow evacuation and sheltering instructions immediately.",
    bn: "রূপপুর পারমাণবিক বিদ্যুৎ কেন্দ্রে সাধারণ জরুরি অবস্থা ঘোষণা করা হয়েছে। অবিলম্বে সরিয়ে নেওয়া ও আশ্রয়ের নির্দেশ অনুসরণ করুন।",
  },
};

const ACTION_COPY: Record<RecommendationAction, { title: string; en: string; bn: string; severity: AlertItem["severity"]; region: string }> = {
  shelter: {
    title: "Shelter-in-place advised",
    en: "Shelter-in-place advised for nearby residents. Close doors and windows and monitor official channels.",
    bn: "নিকটবর্তী বাসিন্দাদের ঘরে আশ্রয় নেওয়ার পরামর্শ দেওয়া হচ্ছে। দরজা-জানালা বন্ধ রাখুন এবং সরকারি চ্যানেল অনুসরণ করুন।",
    severity: "high",
    region: "Precautionary Zone",
  },
  evacuate: {
    title: "Evacuation ordered",
    en: "Evacuation ordered for affected zones. Proceed to designated shelters immediately.",
    bn: "ক্ষতিগ্রস্ত অঞ্চলগুলোর জন্য সরিয়ে নেওয়ার নির্দেশ দেওয়া হয়েছে। অবিলম্বে নির্ধারিত আশ্রয়কেন্দ্রে যান।",
    severity: "critical",
    region: "Evacuation Zone",
  },
  ki_distribution: {
    title: "KI distribution opened",
    en: "Stable iodine (KI) distribution points are now open within the Precautionary Action Zone.",
    bn: "সতর্কীকরণ কর্ম অঞ্চলে স্টেবল আয়োডিন (KI) বিতরণ কেন্দ্র চালু করা হয়েছে।",
    severity: "critical",
    region: "PAZ",
  },
  food_restriction: {
    title: "Food & water restricted",
    en: "Local food and water sources are restricted pending a deposition survey.",
    bn: "জরিপ সম্পন্ন না হওয়া পর্যন্ত স্থানীয় খাদ্য ও পানির উৎস সীমাবদ্ধ করা হয়েছে।",
    severity: "moderate",
    region: "UPZ",
  },
  road_closure: {
    title: "Road corridor closed",
    en: "A road corridor has been closed to evacuation traffic. Use the alternate route provided by the Route Optimizer.",
    bn: "সরিয়ে নেওয়ার যান চলাচলের জন্য একটি সড়ক করিডোর বন্ধ করা হয়েছে। বিকল্প পথ ব্যবহার করুন।",
    severity: "critical",
    region: "Evacuation Corridor",
  },
  airspace_restriction: {
    title: "Airspace restricted",
    en: "Airspace is restricted over the exclusion sector.",
    bn: "বর্জন অঞ্চলের উপর আকাশসীমা সীমাবদ্ধ করা হয়েছে।",
    severity: "high",
    region: "UPZ",
  },
  medical_response: {
    title: "Medical response surged",
    en: "Regional medical response has been surged to support affected areas.",
    bn: "ক্ষতিগ্রস্ত অঞ্চলগুলোকে সহায়তা করতে আঞ্চলিক চিকিৎসা সাড়া বৃদ্ধি করা হয়েছে।",
    severity: "high",
    region: "Regional",
  },
  international_notification: {
    title: "IAEA notified",
    en: "The IAEA and neighboring states have been formally notified.",
    bn: "আইএইএ এবং প্রতিবেশী রাষ্ট্রগুলোকে আনুষ্ঠানিকভাবে অবহিত করা হয়েছে।",
    severity: "moderate",
    region: "International",
  },
};

function bilingualMessage(en: string, bn: string) {
  return `${en}\n${bn}`;
}

let alertSequence = 0;
function nextAlertId(prefix: string) {
  alertSequence += 1;
  return `${prefix}-${alertSequence}`;
}

export function buildClassificationAlerts(level: ClassificationLevel, reason: string, timeLabel: string): AlertItem[] {
  const copy = CLASSIFICATION_COPY[level];
  const severity = CLASSIFICATION_META[level].severity;
  const channels = CHANNELS_BY_SEVERITY[severity];
  return channels.map((channel) => ({
    id: nextAlertId("cls"),
    time: timeLabel,
    title: copy.title,
    message: `${bilingualMessage(copy.en, copy.bn)}\n(${reason})`,
    severity,
    channel,
    region: "Rooppur NPP Sector",
    acknowledged: false,
  }));
}

export function buildRecommendationAlerts(action: RecommendationAction, timeLabel: string): AlertItem[] {
  const copy = ACTION_COPY[action];
  const channels = CHANNELS_BY_SEVERITY[copy.severity];
  return channels.map((channel) => ({
    id: nextAlertId("rec"),
    time: timeLabel,
    title: copy.title,
    message: bilingualMessage(copy.en, copy.bn),
    severity: copy.severity,
    channel,
    region: copy.region,
    acknowledged: false,
  }));
}
