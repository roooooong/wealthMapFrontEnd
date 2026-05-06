export interface RiskAssessmentRequest {
    userId: number;
    // ageScore: number;
    // knowledgeScore: number;
    // experienceScore: number;
    // toleranceScore: number;
    // durationScore: number;
    // allocationScore: number;
    qOneScore: number;       //about age
    qTwoScore: number;       //about knowledge
    qThreeOneScore: number;  //about experience
    qFourScore: number;      //about tolerance
    qFiveScore: number;      //about duration
    qSixScore: number;       //about financial condition
    qSevenScore: number;     //about assest allocation
    qEightScore: number;     //about trading frequency
    qNineScore: number;      //about investment objectives
    qTenScore: number;       //about reserve fund
}

// export interface StrategyResponse {
//     allocation: { [key: string]: number };
//     [key: string]: any;
// }

export interface StrategyResponse {
  userLevel:string;
  advice:string;
  isRiskOverMatch:boolean;
  allocation: { [key: string]: number };
  [key: string]: any;
}
