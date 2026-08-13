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
      ],
      patterns: [/\b\d{4}\s?\d{4}\s?\d{4}\b/],
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
      patterns: [/\b(date of birth|born on|place of birth)\b/i],
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
    let text = typeof textOrBuffer === 'string' ? textOrBuffer : textOrBuffer.toString('utf-8');
    const textLower = text.toLowerCase();

    let bestMatch: DocumentType | null = null;
    let highestScore = 0;
    let bestMatchedCount = 0;

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
        const score = Math.min(1.0, 0.5 + matchedCount * 0.15);
        if (score > highestScore) {
          highestScore = score;
          bestMatch = feat.type;
          bestMatchedCount = matchedCount;
        }
      }
    }

    if (!bestMatch || highestScore < 0.6) {
      this.logger.warn(`Document classification unconfirmed or low confidence (score: ${highestScore.toFixed(2)})`);
      return {
        detectedType: bestMatch,
        confidence: Math.round(highestScore * 100) / 100,
        status: highestScore >= 0.4 ? 'MANUAL_REVIEW' : 'REJECTED',
        reason: 'Uploaded document content could not be verified with sufficient confidence.',
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
      };
    }

    return {
      detectedType: bestMatch,
      confidence,
      status: 'ACCEPTED',
      extractedFields: {
        detectedType: bestMatch,
        confidence,
      },
    };
  }
}
