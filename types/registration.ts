export interface FormData {
  name: string
  chapterName: string
  category: string
  contactNo: string
  email: string
  ticketType: "Platinum" | "Gold" | "Silver" | ""
  spouseName?: string
  children: Array<{ name: string; age: "<12" | ">12" }>
  participations: string[]
  conclavGroups: string[]
}
