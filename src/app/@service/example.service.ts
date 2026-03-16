import { Injectable } from '@angular/core';
import { QuestionaireElement } from '../questionaire-list/questionaire-list.component';
import { QuestionnaireApi, Question, Option,
         UserAnswer, QuestSet, QuestType } from '../@interface/questionnaire-api';


@Injectable({
  providedIn: 'root'
})

// 上面區塊 使用來告訴系統這支檔案是大家共用的
// 因為上面這區塊 在我的專案一開始執行的時候就會把這支檔案執行放在後台


export class ExampleService {
  // 設定service欲傳輸的全域變數
  sendData!: string;
  userName!: string;
  userEmail!: string;
  userAge!: number;

  // Questionaire --> QuestionaireList & QuestionaireList <--> QuestionaireFront &
  userType!: string;
  // QuestionaireList <--> QuestionaireFront
  questionInfo!:Array<QuestionaireElement>;
  // QuestionaireList --> QuestionaireSet
  userAct!:string;
  questionnaireId!:number;
  // QuestionaireSet --> QuestionaireRead
  questionSet!:QuestSet;
  // QuestionaireSetDetail --> QuestionaireRead
  questionDetail!:Array<QuestType>;
  userAnswer!:UserAnswer;
 // QuestionaireFeedBack --> QuestionaireRead
  responseId:number| null = null;

  //to-do Add
  // inputNewItem!: Array<string> ;
  inputNewItem: Array<any> = [
    {
      id:"test",
      state:"incomplete",
      startDate:"26/1/12, 13:48"
    },
    {
      id:"test1",
      state:"incomplete",
      startDate:"26/1/12, 13:49"
    }];
  editItem!:Array<any>;

  //weather selected
  dataInfo!:Array<any>;
  selectedConent!:string;


  constructor() { }
}
