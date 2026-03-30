export interface NotificationList {
  code: number
  data: Array<Data>
  message: string
}
export interface Data {
  id?: number
  content: string
  createTime?: string
  scheduledDate: string
  tag: string
  title: string
  hasRead: boolean;
}
