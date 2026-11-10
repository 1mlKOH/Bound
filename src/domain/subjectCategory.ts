export type SubjectCategoryKey =
  | 'physics'
  | 'computer-science'
  | 'economics'
  | 'chemistry'
  | 'mathematics'
  | 'biology'
  | 'medicine'
  | 'electrical'
  | 'engineering'
  | 'literature'
  | 'languages'
  | 'history'
  | 'law'
  | 'psychology'
  | 'art'
  | 'music'
  | 'geography'
  | 'sports'
  | 'media'
  | 'environment'
  | 'general'
  | 'veterinary'
  | 'anatomy'
  | 'physiology'
  | 'livestock'
  | 'pathology'
  | 'pharmacology'
  | 'database'
  | 'architecture';

export interface SubjectCategoryMeta {
  key: SubjectCategoryKey;
  label: string;
  description: string;
}

export const SUBJECT_CATEGORY_METAS: Record<SubjectCategoryKey, SubjectCategoryMeta> = {
  physics: {
    key: 'physics',
    label: 'Physics & Quantum',
    description: 'Atom orbital rings with central nucleus',
  },
  'computer-science': {
    key: 'computer-science',
    label: 'Computer Science & Data Structures',
    description: 'Connected binary tree & hierarchy nodes',
  },
  economics: {
    key: 'economics',
    label: 'Economics & Finance',
    description: 'Rising financial trend arrow over rounded bar columns',
  },
  chemistry: {
    key: 'chemistry',
    label: 'Chemistry & Materials',
    description: 'Conical Erlenmeyer flask with liquid wave and bubbles',
  },
  mathematics: {
    key: 'mathematics',
    label: 'Mathematics & Calculus',
    description: 'Radical square root with operational signs',
  },
  biology: {
    key: 'biology',
    label: 'Biology & Life Sciences',
    description: 'Intertwined DNA double helix strands',
  },
  medicine: {
    key: 'medicine',
    label: 'Medicine & Health',
    description: 'Acoustic clinical stethoscope with ear tips',
  },
  electrical: {
    key: 'electrical',
    label: 'Electrical & Electronics',
    description: 'Microchip processor with conductive pin traces',
  },
  engineering: {
    key: 'engineering',
    label: 'Engineering & Mechanics',
    description: 'Interlocking mechanical gear cogs',
  },
  literature: {
    key: 'literature',
    label: 'Literature & Writing',
    description: 'Open hardcover book with tipped feather quill',
  },
  languages: {
    key: 'languages',
    label: 'Languages & Linguistics',
    description: 'Overlapping conversation speech bubbles',
  },
  history: {
    key: 'history',
    label: 'History & Civilizations',
    description: 'Classical Greek Pantheon columns & pediment',
  },
  law: {
    key: 'law',
    label: 'Law & Political Science',
    description: 'Equilibrium scales of justice',
  },
  psychology: {
    key: 'psychology',
    label: 'Psychology & Philosophy',
    description: 'Human head profile with radiant cerebral core',
  },
  art: {
    key: 'art',
    label: 'Art, Design & Architecture',
    description: 'Artist color palette with mixing brush',
  },
  music: {
    key: 'music',
    label: 'Music & Audio',
    description: 'Eighth notes on angled melodic beam',
  },
  geography: {
    key: 'geography',
    label: 'Geography & Earth Sciences',
    description: 'Tilted terrestrial globe with meridian parallels',
  },
  sports: {
    key: 'sports',
    label: 'Physical Education & Sports',
    description: 'Olympic barbell dumbbell with weight plates',
  },
  media: {
    key: 'media',
    label: 'Communication & Media',
    description: 'Acoustic broadcast megaphone bullhorn',
  },
  environment: {
    key: 'environment',
    label: 'Environment & Agriculture',
    description: 'Sprouting twin cotyledon plant leaves',
  },
  general: {
    key: 'general',
    label: 'General Studies',
    description: 'Mortarboard graduation cap with hanging tassel',
  },
  veterinary: {
    key: 'veterinary',
    label: 'Veterinary & Animal Science',
    description: 'Animal care paw print',
  },
  anatomy: {
    key: 'anatomy',
    label: 'Anatomy & Morphology',
    description: 'Structural bone anatomy & skeletal morphology',
  },
  physiology: {
    key: 'physiology',
    label: 'Physiology & Diagnostics',
    description: 'Cardiovascular pulse rhythm & physiological vitals',
  },
  livestock: {
    key: 'livestock',
    label: 'Livestock & Farm Management',
    description: 'Agricultural machinery & animal husbandry management',
  },
  pathology: {
    key: 'pathology',
    label: 'Pathology & Microbiology',
    description: 'Laboratory diagnostic microscope & specimen analysis',
  },
  pharmacology: {
    key: 'pharmacology',
    label: 'Pharmacology & Therapeutics',
    description: 'Therapeutic pharmaceutical capsule & dosage prescription',
  },
  database: {
    key: 'database',
    label: 'Databases & Data Engineering',
    description: 'Relational database cylinder storage stack',
  },
  architecture: {
    key: 'architecture',
    label: 'Architecture & Spatial Design',
    description: 'Architectural building elevation & structural planning',
  },
};

/**
 * Intelligent Academic Category Detector
 * Evaluates both subject title and course code against keywords, abbreviations, and regex patterns.
 */
export function detectSubjectCategory(
  name?: string,
  code?: string
): { key: SubjectCategoryKey; label: string } {
  const normCode = (code || '').trim().toLowerCase();
  const text = `${name || ''} ${code || ''}`.toLowerCase().trim();
  if (!text) {
    return { key: 'general', label: SUBJECT_CATEGORY_METAS.general.label };
  }

  // 0. High-Specificity Functional Concepts (Cross-Disciplinary Sub-Fields)
  // Evaluated first so that e.g. "Veterinary Physiology" (VET101) or "Cardiovascular Physiology" (MED201)
  // gets the pulse-rhythm icon instead of a generic paw or hospital badge,
  // and "Database Systems" (CS202) gets a database cylinder icon instead of a generic code icon.

  // Physiology & Diagnostics
  if (
    /\b(physiology|physiological|cardio|cardiovascular|neurophysiology|hemodynamics|pulmonary|electrophysiology|pathophysiology)\b/i.test(
      text
    )
  ) {
    return { key: 'physiology', label: SUBJECT_CATEGORY_METAS.physiology.label };
  }

  // Anatomy & Structural Morphology
  if (
    /\b(anatomy|anatomical|morphology|dissection|skeletal|skeleton|osteology|histology|myology|arthrology|neuroanatomy)\b/i.test(
      text
    )
  ) {
    return { key: 'anatomy', label: SUBJECT_CATEGORY_METAS.anatomy.label };
  }

  // Livestock & Animal Production / Husbandry
  if (
    /\b(livestock|husbandry|poultry|dairy|cattle|ruminant|swine|pasture|animal\s*production|farm\s*management|feedlot|forage)\b/i.test(
      text
    ) ||
    /^(lpm|anp|as)\s*\d+/i.test(normCode)
  ) {
    return { key: 'livestock', label: SUBJECT_CATEGORY_METAS.livestock.label };
  }

  // Pathology, Microbiology & Parasitology
  if (
    /\b(pathology|pathological|microbiology|parasitology|virology|bacteriology|immunology|histopathology|hematology|serology)\b/i.test(
      text
    ) ||
    /^(path|mic|para)\s*\d+/i.test(normCode)
  ) {
    return { key: 'pathology', label: SUBJECT_CATEGORY_METAS.pathology.label };
  }

  // Pharmacology, Pharmacy & Therapeutics
  if (
    /\b(pharmacology|toxicology|therapeutics|pharmaceutical|posology|pharmacokinetics|pharmacodynamics|prescription)\b/i.test(
      text
    ) ||
    /^(phm|pharm|tox)\s*\d+/i.test(normCode)
  ) {
    return { key: 'pharmacology', label: SUBJECT_CATEGORY_METAS.pharmacology.label };
  }

  // Databases & Data Systems
  if (
    /\b(database|databases|dbms|rdbms|sql|nosql|mongodb|postgresql|mysql|data\s*warehousing|big\s*data|query\s*optimization)\b/i.test(
      text
    )
  ) {
    return { key: 'database', label: SUBJECT_CATEGORY_METAS.database.label };
  }

  // Architecture & Spatial Design
  if (
    /\b(architecture|architectural|urban\s*planning|spatial\s*design|building\s*construction|landscape\s*arch|interior\s*design)\b/i.test(
      text
    ) ||
    /^(arch|arc|ur)\s*\d+/i.test(normCode)
  ) {
    return { key: 'architecture', label: SUBJECT_CATEGORY_METAS.architecture.label };
  }

  // Veterinary Medicine & Animal Sciences (General veterinary)
  if (
    /\b(veterinary|vet|bvsc|animal\s*science|canine|feline|equine|bovine|zoology|wildlife|animal\s*nutrition|animal\s*welfare)\b/i.test(
      text
    ) ||
    /^(vet|bvsc|van|vpa|vpy)\s*\d+/i.test(normCode)
  ) {
    return { key: 'veterinary', label: SUBJECT_CATEGORY_METAS.veterinary.label };
  }

  // 1. Department course code prefix match (broad fallback when no functional concept matches)
  if (normCode) {
    if (/^(vet|bvsc)\s*\d+/i.test(normCode)) {
      return { key: 'veterinary', label: SUBJECT_CATEGORY_METAS.veterinary.label };
    }
    if (/^(cs|cse|it|cis|swe|cpt)\s*\d+/i.test(normCode)) {
      return {
        key: 'computer-science',
        label: SUBJECT_CATEGORY_METAS['computer-science'].label,
      };
    }
    if (/^(phy|phys|ast|astr)\s*\d+/i.test(normCode)) {
      return { key: 'physics', label: SUBJECT_CATEGORY_METAS.physics.label };
    }
    if (/^(eco|econ|fin|acc|act|bus|mgt|mba)\s*\d+/i.test(normCode)) {
      return { key: 'economics', label: SUBJECT_CATEGORY_METAS.economics.label };
    }
    if (/^(che|chem|chm|bch)\s*\d+/i.test(normCode)) {
      return { key: 'chemistry', label: SUBJECT_CATEGORY_METAS.chemistry.label };
    }
    if (/^(mat|math|calc|sta|stat)\s*\d+/i.test(normCode)) {
      return { key: 'mathematics', label: SUBJECT_CATEGORY_METAS.mathematics.label };
    }
    if (/^(bio|biol|zoo|bot|gen)\s*\d+/i.test(normCode)) {
      return { key: 'biology', label: SUBJECT_CATEGORY_METAS.biology.label };
    }
    if (/^(med|nur|nurs|phm|pharm)\s*\d+/i.test(normCode)) {
      return { key: 'medicine', label: SUBJECT_CATEGORY_METAS.medicine.label };
    }
    if (/^(ee|eee|ece|etx)\s*\d+/i.test(normCode)) {
      return { key: 'electrical', label: SUBJECT_CATEGORY_METAS.electrical.label };
    }
    if (/^(me|mech|ce|civ|engr|egr)\s*\d+/i.test(normCode)) {
      return { key: 'engineering', label: SUBJECT_CATEGORY_METAS.engineering.label };
    }
    if (/^(eng|engl|lit|wri)\s*\d+/i.test(normCode)) {
      return { key: 'literature', label: SUBJECT_CATEGORY_METAS.literature.label };
    }
    if (/^(spa|fre|ger|hin|jpn|chi|rus|ara|ita|kor|lng|lan)\s*\d+/i.test(normCode)) {
      return { key: 'languages', label: SUBJECT_CATEGORY_METAS.languages.label };
    }
    if (/^(his|hist|arc|arch)\s*\d+/i.test(normCode)) {
      return { key: 'history', label: SUBJECT_CATEGORY_METAS.history.label };
    }
    if (/^(law|leg|pol|gov|pos)\s*\d+/i.test(normCode)) {
      return { key: 'law', label: SUBJECT_CATEGORY_METAS.law.label };
    }
    if (/^(psy|psyc|phi|phil|soc)\s*\d+/i.test(normCode)) {
      return { key: 'psychology', label: SUBJECT_CATEGORY_METAS.psychology.label };
    }
    if (/^(art|des|gra)\s*\d+/i.test(normCode)) {
      return { key: 'art', label: SUBJECT_CATEGORY_METAS.art.label };
    }
    if (/^(mus|musi|aud)\s*\d+/i.test(normCode)) {
      return { key: 'music', label: SUBJECT_CATEGORY_METAS.music.label };
    }
    if (/^(geo|geog|glg|ear)\s*\d+/i.test(normCode)) {
      return { key: 'geography', label: SUBJECT_CATEGORY_METAS.geography.label };
    }
    if (/^(pe|phe|ath|kin)\s*\d+/i.test(normCode)) {
      return { key: 'sports', label: SUBJECT_CATEGORY_METAS.sports.label };
    }
    if (/^(com|comm|jou|jrn)\s*\d+/i.test(normCode)) {
      return { key: 'media', label: SUBJECT_CATEGORY_METAS.media.label };
    }
    if (/^(env|agr|for)\s*\d+/i.test(normCode)) {
      return { key: 'environment', label: SUBJECT_CATEGORY_METAS.environment.label };
    }
  }

  // 1. Engineering compound terms (fluid mechanics, etc.)
  if (
    /\b(fluid\s*mechanics|soil\s*mechanics|structural\s*mechanics|engineering\s*mechanics|materials\s*science|heat\s*transfer)\b/i.test(
      text
    )
  ) {
    return { key: 'engineering', label: SUBJECT_CATEGORY_METAS.engineering.label };
  }

  // 2. Computer Science & Data Structures (Prioritize specific compound like 'data structures')
  if (
    /\b(data\s*structures?|algorithms?|dsa|tree|graph|binary|software|programming|coding|computer|computing|cs|cse|it|web\s*dev|python|java|c\+\+|javascript|typescript|compiler|operating\s*systems?|database|dbms|sql|networking|cyber|ai|machine\s*learning|deep\s*learning)\b/i.test(
      text
    ) ||
    /^(cs|cse|it|cis|swe|cpt)\s*\d+/i.test(text)
  ) {
    return {
      key: 'computer-science',
      label: SUBJECT_CATEGORY_METAS['computer-science'].label,
    };
  }

  // 3. Physics & Quantum
  if (
    /\b(physics|quantum|astronomy|astrophysics|relativity|electromagnetism|thermodynamics|optics|particle|kinematics|nuclear|solid\s*state|mechanics|phy|phys)\b/i.test(
      text
    ) ||
    /^(phy|phys|ast|astr)\s*\d+/i.test(text)
  ) {
    return { key: 'physics', label: SUBJECT_CATEGORY_METAS.physics.label };
  }

  // 3. Economics & Finance
  if (
    /\b(economics?|microeconomics?|macroeconomics?|finance|financial|accounting|commerce|banking|econometrics|macro|micro|business|marketing|investment|mba|eco|econ|fin|acc|bus)\b/i.test(
      text
    ) ||
    /^(eco|econ|fin|acc|act|bus|mgt|mba)\s*\d+/i.test(text)
  ) {
    return { key: 'economics', label: SUBJECT_CATEGORY_METAS.economics.label };
  }

  // 4. Chemistry & Materials
  if (
    /\b(chemistry|chemical|organic|inorganic|biochem|biochemistry|spectroscopy|polymers?|reactions?|che|chem|chm)\b/i.test(
      text
    ) ||
    /^(che|chem|chm|bch)\s*\d+/i.test(text)
  ) {
    return { key: 'chemistry', label: SUBJECT_CATEGORY_METAS.chemistry.label };
  }

  // 5. Mathematics & Calculus
  if (
    /\b(mathematics?|math|maths|calculus|algebra|geometry|trigonometry|linear\s*algebra|differential|discrete\s*math|statistics?|probability|topology|number\s*theory|mat|calc|stat)\b/i.test(
      text
    ) ||
    /^(mat|math|calc|sta|stat)\s*\d+/i.test(text)
  ) {
    return { key: 'mathematics', label: SUBJECT_CATEGORY_METAS.mathematics.label };
  }

  // 6. Biology & Life Sciences
  if (
    /\b(biology|biological|genetics|botany|zoology|microbiology|ecology|evolution|dna|cellular|biol?|zoo|bot)\b/i.test(
      text
    ) ||
    /^(bio|biol|zoo|bot|gen)\s*\d+/i.test(text)
  ) {
    return { key: 'biology', label: SUBJECT_CATEGORY_METAS.biology.label };
  }

  // 7. Medicine & Health
  if (
    /\b(medicine|medical|nursing|anatomy|physiology|pharmacy|pharmacology|pathology|clinical|surgery|pediatrics|health|healthcare|dental|med|nurs|pharm)\b/i.test(
      text
    ) ||
    /^(med|nur|nurs|phm|pharm)\s*\d+/i.test(text)
  ) {
    return { key: 'medicine', label: SUBJECT_CATEGORY_METAS.medicine.label };
  }

  // 8. Electrical & Electronics
  if (
    /\b(electrical|electronics?|circuits?|vlsi|embedded|microprocessor|telecom|telecommunication|signals?|semiconductor|power\s*systems?|ee|eee|ece)\b/i.test(
      text
    ) ||
    /^(ee|eee|ece|etx)\s*\d+/i.test(text)
  ) {
    return { key: 'electrical', label: SUBJECT_CATEGORY_METAS.electrical.label };
  }

  // 9. Mechanical & Civil Engineering
  if (
    /\b(mechanical|civil|structural|engineering|fluid\s*mechanics|thermo|heat\s*transfer|cad|solidworks|manufacturing|automotive|materials\s*science|engg?|mech|civ)\b/i.test(
      text
    ) ||
    /^(me|mech|ce|civ|engr|egr)\s*\d+/i.test(text)
  ) {
    return { key: 'engineering', label: SUBJECT_CATEGORY_METAS.engineering.label };
  }

  // 10. Literature & Writing
  if (
    /\b(literature|english|writing|poetry|prose|novel|fiction|essay|creative\s*writing|rhetoric|composition|lit)\b/i.test(
      text
    ) ||
    /^(eng|engl|lit|wri)\s*\d+/i.test(text)
  ) {
    return { key: 'literature', label: SUBJECT_CATEGORY_METAS.literature.label };
  }

  // 11. Languages & Linguistics
  if (
    /\b(languages?|linguistics|grammar|spanish|french|german|hindi|japanese|chinese|mandarin|arabic|russian|italian|korean|translation|lang)\b/i.test(
      text
    ) ||
    /^(spa|fre|ger|hin|jpn|chi|rus|ara|ita|kor|lng|lan)\s*\d+/i.test(text)
  ) {
    return { key: 'languages', label: SUBJECT_CATEGORY_METAS.languages.label };
  }

  // 12. History & Civilizations
  if (
    /\b(history|historical|archaeology|civilizations?|ancient|medieval|renaissance|world\s*war|heritage|hist|his)\b/i.test(
      text
    ) ||
    /^(his|hist|arc|arch)\s*\d+/i.test(text)
  ) {
    return { key: 'history', label: SUBJECT_CATEGORY_METAS.history.label };
  }

  // 13. Law & Political Science
  if (
    /\b(law|legal|justice|jurisprudence|constitution|constitutional|court|rights|torts?|contracts?|criminology|political|politics|polity|public\s*policy|pol|gov)\b/i.test(
      text
    ) ||
    /^(law|leg|pol|gov|pos)\s*\d+/i.test(text)
  ) {
    return { key: 'law', label: SUBJECT_CATEGORY_METAS.law.label };
  }

  // 14. Psychology & Philosophy
  if (
    /\b(psychology|psychological|philosophy|philosophical|ethics|sociology|sociological|cognitive|behavioral|mental|logic|epistemology|psy|psyc|phil|soc)\b/i.test(
      text
    ) ||
    /^(psy|psyc|phi|phil|soc)\s*\d+/i.test(text)
  ) {
    return { key: 'psychology', label: SUBJECT_CATEGORY_METAS.psychology.label };
  }

  // 15. Art, Design & Architecture
  if (
    /\b(art|arts|design|drawing|painting|graphics?|illustration|sculpture|architecture|visual|ui\/ux|ux|animation|fashion|photography|art|des)\b/i.test(
      text
    ) ||
    /^(art|des|arc|arch|gra)\s*\d+/i.test(text)
  ) {
    return { key: 'art', label: SUBJECT_CATEGORY_METAS.art.label };
  }

  // 16. Music & Audio
  if (
    /\b(music|musical|audio|sound|vocal|choir|band|orchestra|melody|composition|instrument|guitar|piano|violin|mus)\b/i.test(
      text
    ) ||
    /^(mus|musi|aud)\s*\d+/i.test(text)
  ) {
    return { key: 'music', label: SUBJECT_CATEGORY_METAS.music.label };
  }

  // 17. Geography & Earth Sciences
  if (
    /\b(geography|geographic|geology|earth\s*science|geological|meteorology|climate|cartography|gis|oceanography|geo|geog)\b/i.test(
      text
    ) ||
    /^(geo|geog|glg|ear)\s*\d+/i.test(text)
  ) {
    return { key: 'geography', label: SUBJECT_CATEGORY_METAS.geography.label };
  }

  // 18. Physical Education & Athletics
  if (
    /\b(physical\s*education|pe|sports?|athletics?|fitness|gym|kinesiology|exercise|training|yoga|swimming|phe)\b/i.test(
      text
    ) ||
    /^(pe|phe|ath|kin)\s*\d+/i.test(text)
  ) {
    return { key: 'sports', label: SUBJECT_CATEGORY_METAS.sports.label };
  }

  // 19. Communication & Media
  if (
    /\b(communication|journalism|media|broadcasting|public\s*relations|pr|mass\s*comm|speech|reporting|comm|jour)\b/i.test(
      text
    ) ||
    /^(com|comm|jou|jrn)\s*\d+/i.test(text)
  ) {
    return { key: 'media', label: SUBJECT_CATEGORY_METAS.media.label };
  }

  // 20. Environment & Agriculture
  if (
    /\b(environmental?|ecology|agriculture|agricultural|forestry|sustainability|farming|horticulture|agri|env|agro)\b/i.test(
      text
    ) ||
    /^(env|agr|for)\s*\d+/i.test(text)
  ) {
    return { key: 'environment', label: SUBJECT_CATEGORY_METAS.environment.label };
  }

  // 21. General Studies (Default)
  return { key: 'general', label: SUBJECT_CATEGORY_METAS.general.label };
}
