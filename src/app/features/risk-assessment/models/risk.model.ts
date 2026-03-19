export interface RiskAssessmentRequest {
    userId: number;
    ageScore: number;
    knowledgeScore: number;
    experienceScore: number;
    toleranceScore: number;
    durationScore: number;
    allocationScore: number;
}

export interface StrategyResponse {
    allocation: { [key: string]: number };
    [key: string]: any;
}
