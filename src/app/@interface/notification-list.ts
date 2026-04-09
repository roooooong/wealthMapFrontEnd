export interface NotificationList {
  code: number,
  data: Array<Data>,
  message: string
}
export interface Data {
  id?: number,
  content: string,
  createTime?: string,
  scheduledDate: string,
  tag: string,
  title: string,
  hasRead: boolean
}

export interface PersonalNotification {
  id: number,
  alertTime: string,
  category: string,
  channel: string,
  content: string,
  read: boolean,
  target_id: number,
  title: string,
  user_id: number,
  error_message: string,
  retry_count: number,
  status: string

}

export interface SseMessage {
  id: number;
  content: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
}
