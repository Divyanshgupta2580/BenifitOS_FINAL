import { Injectable, Logger } from '@nestjs/common';
import { DocumentType, DOCUMENT_TYPE_DISPLAY_NAMES } from '../../domain/welfare/scheme.entity';

export interface DocumentClassificationResult {
  detectedType: DocumentType | null;
  confidence: number;
  status: 'ACCEPTED' | 'REJECTED' | 'MANUAL_REVIEW';
  reason?: string;
  extractedFields?: Record<string, any>;
  rawText?: string;
}

interface DocumentFeature {
  type: DocumentType;
  keywords: string[];
  patterns: RegExp[];
  minMatches: number;
}

@Injectable()
export class DocumentClassificationService {
  private readonly logger = new Logger(DocumentClassificationService.name);

  private readonly features: DocumentFeature[] = [
    {
      type: DocumentType.AADHAAR,
      keywords: [
        'unique identification authority of india',
        'uidai',
        'mera aadhaar',
        'aadhaar',
        'government of india',
        'enrollment no',
        'vid',
        'help@uidai.gov.in',
      ],
      patterns: [/\b\d{4}\s?\d{4}\s?\d{4}\b/],
      minMatches: 2,
    },
    {
      type: DocumentType.PAN_CARD,
      keywords: [
        'income tax department',
        'permanent account number card',
        'permanent account number',
        'pan card',
        'govt. of india',
        'father\'s name',
      ],
      patterns: [/\b[A-Z]{5}[0-9]{4}[A-Z]\b/],
      minMatches: 2,
    },
    {
      type: DocumentType.INCOME_CERTIFICATE,
      keywords: [
        'income certificate',
        'certificate of income',
        'revenue department',
        'annual family income',
        'tehsildar',
        'sub-divisional magistrate',
        'competent revenue authority',
        'praman patra',
        'aay praman',
      ],
      patterns: [/\b(?:income|annual income|rs\.?|inr)\s*[:=-]?\s*₹?\s*(\d[\d,]*)/i],
      minMatches: 2,
    },
    {
      type: DocumentType.RATION_CARD,
      keywords: [
        'ration card',
        'food and civil supplies',
        'department of food',
        'nfsa',
        'antodaya',
        'priority household',
        'bpl card',
        'fair price shop',
        'fps',
      ],
      patterns: [/\b(?:ration\s*card|rc)\s*(?:no|number)?\s*[:=-]?\s*([A-Z0-9/-]+)\b/i],
      minMatches: 2,
    },
    {
      type: DocumentType.LAND_RECORD,
      keywords: [
        'land record',
        'khasra',
        'khatauni',
        'jamabandi',
        'revenue record',
        'landholding',
        'survey number',
        'cultivable land',
        'patwari',
        'tehsil',
        'bhulekh',
      ],
      patterns: [/\b(?:khasra|khata|survey)\s*(?:no|number)?\s*[:=-]?\s*([0-9/A-Z-]+)\b/i],
      minMatches: 2,
    },
    {
      type: DocumentType.BANK_PASSBOOK,
      keywords: [
        'bank passbook',
        'account statement',
        'savings bank account',
        'ifsc',
        'branch',
        'account number',
        'micr',
        'state bank of india',
        'punjab national bank',
        'bank of baroda',
        'canara bank',
        'union bank',
        'hdfc bank',
        'icici bank',
      ],
      patterns: [/\b(?:ifsc|ifsc\s*code)\s*[:=-]?\s*([A-Z]{4}0[A-Z0-9]{6})\b/i, /\b(?:a\/c|account\s*no|ac\s*no)\s*[:=-]?\s*(\d{9,18})\b/i],
      minMatches: 2,
    },
    {
      type: DocumentType.DRIVING_LICENSE,
      keywords: [
        'driving licence',
        'driving license',
        'union of india driving licence',
        'licence no',
        'dl no',
        'transport department',
        'authorisation to drive',
        'motor vehicles',
      ],
      patterns: [/\b[A-Z]{2}[0-9]{2}\s?[0-9]{11}\b/i, /\bDL[- ]?[A-Z0-9]+\b/i],
      minMatches: 2,
    },
    {
      type: DocumentType.VOTER_ID,
      keywords: [
        'election commission of india',
        'voter id',
        'elector photo identity card',
        'epic no',
        'identity card',
        'elector',
        'bharat nirvachan aayog',
      ],
      patterns: [/\b[A-Z]{3}[0-9]{7}\b/],
      minMatches: 2,
    },
    {
      type: DocumentType.BIRTH_CERTIFICATE,
      keywords: [
        'birth certificate',
        'certificate of birth',
        'registration of births',
        'department of health',
        'municipal corporation',
        'date of birth',
        'form no 5',
      ],
      patterns: [/\b(?:date of birth|born on|place of birth)\b/i],
      minMatches: 2,
    },
    {
      type: DocumentType.EDUCATIONAL_CERTIFICATE,
      keywords: [
        'educational certificate',
        'marksheet',
        'statement of marks',
        'passing certificate',
        'board of secondary education',
        'secondary school',
        'degree certificate',
        'university',
        'school leaving certificate',
        'higher secondary',
      ],
      patterns: [/\b(marks|grade|roll no|passed|examination|cgpa)\b/i],
      minMatches: 2,
    },
    {
      type: DocumentType.DISABILITY_CERTIFICATE,
      keywords: [
        'disability certificate',
        'persons with disabilities',
        'medical authority',
        'percentage of disability',
        'disability percentage',
        'benchmark disability',
        'permanent disability',
        'medical board',
      ],
      patterns: [/\b(disability|handicap|locomotor|visual impairment|hearing impairment)\b/i],
      minMatches: 2,
    },
    {
      type: DocumentType.CASTE_CERTIFICATE,
      keywords: [
        'caste certificate',
        'community certificate',
        'scheduled caste',
        'scheduled tribe',
        'other backward class',
        'obc certificate',
        'tehsildar',
        'sub-divisional officer',
        'social category',
      ],
      patterns: [/\b(caste|community|sc\/st|obc)\b/i],
      minMatches: 2,
    },
  ];

  /**
   * Classifies document based strictly on file text content (OCR / buffer analysis).
   * Does NOT check filename, extension, or user claims.
   */
  public classifyDocumentContent(
    textOrBuffer: string | Buffer,
    expectedType?: DocumentType,
  ): DocumentClassificationResult {
    const text = typeof textOrBuffer === 'string' ? textOrBuffer : textOrBuffer.toString('utf-8');
    const textLower = text.toLowerCase();

    let bestMatch: DocumentType | null = null;
    let highestScore = 0;

    for (const feat of this.features) {
      let matchedCount = 0;

      // Check keywords
      for (const kw of feat.keywords) {
        if (textLower.includes(kw.toLowerCase())) {
          matchedCount++;
        }
      }

      // Check pattern matches
      for (const pattern of feat.patterns) {
        if (pattern.test(text)) {
          matchedCount += 2; // Regex pattern match gives strong weight
        }
      }

      if (matchedCount >= feat.minMatches) {
        const score = Math.min(0.98, 0.5 + matchedCount * 0.12);
        if (score > highestScore) {
          highestScore = score;
          bestMatch = feat.type;
        }
      }
    }

    // Extract structured fields based on detected / expected document type
    const extractedFields = this.extractStructuredFields(text, bestMatch || expectedType);

    if (!bestMatch || highestScore < 0.5) {
      this.logger.warn(`Document classification unconfirmed or low confidence (score: ${highestScore.toFixed(2)})`);
      return {
        detectedType: bestMatch,
        confidence: Math.round(highestScore * 100) / 100,
        status: highestScore >= 0.3 ? 'MANUAL_REVIEW' : 'REJECTED',
        reason: 'Uploaded document content could not be verified with sufficient confidence.',
        extractedFields,
        rawText: text.substring(0, 100), // Privacy: limit raw text logging/export
      };
    }

    const confidence = Math.round(highestScore * 100) / 100;
    this.logger.log(`Document detected as ${bestMatch} with confidence ${confidence}`);

    if (expectedType && bestMatch !== expectedType) {
      const expectedName = DOCUMENT_TYPE_DISPLAY_NAMES[expectedType] || expectedType;
      const detectedName = DOCUMENT_TYPE_DISPLAY_NAMES[bestMatch] || bestMatch;
      return {
        detectedType: bestMatch,
        confidence,
        status: 'REJECTED',
        reason: `Incorrect document. Required: ${expectedName}, Detected: ${detectedName}. Please upload your ${expectedName}.`,
        extractedFields,
      };
    }

    return {
      detectedType: bestMatch,
      confidence,
      status: 'ACCEPTED',
      extractedFields,
    };
  }

  /**
   * Helper to parse structured fields out of raw document text.
   * Redacts sensitive numbers in public structures where appropriate.
   */
  public extractStructuredFields(text: string, docType?: DocumentType | null): Record<string, any> {
    const fields: Record<string, any> = {};

    // Common fields
    const nameMatch = text.match(/(?:Name|नाम|Full Name)\s*[:=-]?\s*([A-Za-z\s]{3,40})/i);
    if (nameMatch && nameMatch[1].trim()) {
      fields.fullName = nameMatch[1].trim().replace(/[\r\n\t]/g, ' ');
    }

    const dobMatch = text.match(/(?:DOB|Date of Birth|जन्म तिथि|Birth Date)\s*[:=-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{4})/i);
    if (dobMatch) {
      fields.dateOfBirth = dobMatch[1];
    }

    const genderMatch = text.match(/\b(MALE|FEMALE|TRANSGENDER|पुरुष|महिला)\b/i);
    if (genderMatch) {
      const g = genderMatch[1].toUpperCase();
      fields.gender = g.includes('FEMALE') || g.includes('महिला') ? 'FEMALE' : 'MALE';
    }

    // Document-specific number extractions
    if (docType === DocumentType.AADHAAR || !docType) {
      const aadhaarMatch = text.match(/\b\d{4}\s?\d{4}\s?(\d{4})\b/);
      if (aadhaarMatch) {
        fields.documentNumberMasked = `XXXX-XXXX-${aadhaarMatch[1]}`;
        fields.documentType = DocumentType.AADHAAR;
      }
    }

    if (docType === DocumentType.PAN_CARD || !docType) {
      const panMatch = text.match(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/);
      if (panMatch) {
        const pan = panMatch[0];
        fields.documentNumberMasked = `${pan.slice(0, 5)}XXXX${pan.slice(-1)}`;
        fields.documentType = DocumentType.PAN_CARD;
      }
    }

    if (docType === DocumentType.VOTER_ID || !docType) {
      const voterMatch = text.match(/\b[A-Z]{3}[0-9]{7}\b/);
      if (voterMatch) {
        fields.documentNumber = voterMatch[0];
        fields.documentType = DocumentType.VOTER_ID;
      }
    }

    if (docType === DocumentType.DRIVING_LICENSE || !docType) {
      const dlMatch = text.match(/\b[A-Z]{2}[0-9]{2}\s?[0-9]{11}\b/i);
      if (dlMatch) {
        fields.documentNumber = dlMatch[0];
        fields.documentType = DocumentType.DRIVING_LICENSE;
      }
    }

    if (docType === DocumentType.INCOME_CERTIFICATE) {
      const incMatch = text.match(/(?:income|annual income|total income|वार्षिक आय)\s*[:=-]?\s*₹?\s*([0-9,]+)/i);
      if (incMatch) {
        fields.annualIncomeINR = parseInt(incMatch[1].replace(/,/g, ''), 10);
      }
    }

    if (docType === DocumentType.BANK_PASSBOOK) {
      const ifscMatch = text.match(/\b[A-Z]{4}0[A-Z0-9]{6}\b/i);
      if (ifscMatch) {
        fields.ifscCode = ifscMatch[0].toUpperCase();
      }
      const acctMatch = text.match(/\b(?:A\/C|Account|Acct)\s*[:=-]?\s*(\d{4,18})\b/i);
      if (acctMatch) {
        const fullAcct = acctMatch[1];
        fields.accountNumberMasked = `XXXXXXXX${fullAcct.slice(-4)}`;
      }
    }

    if (docType === DocumentType.LAND_RECORD) {
      const khasraMatch = text.match(/(?:khasra|khatauni|survey)\s*(?:no|number)?\s*[:=-]?\s*([0-9/A-Z-]+)/i);
      if (khasraMatch) {
        fields.surveyNumber = khasraMatch[1];
      }
      const areaMatch = text.match(/(?:area|size|land size)\s*[:=-]?\s*([0-9.]+)\s*(?:acres?|hectares?|bigha)/i);
      if (areaMatch) {
        fields.landSize = areaMatch[1];
      }
    }

    return fields;
  }
}
