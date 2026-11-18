export type StaffUser = {
  username: string;
  name: string;
};

export type StaffStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today: number;
  by_class: { applying_class: string; total: number }[];
  fee_collected: string;
  fee_pending: string;
  fee_submitted: string;
  currency: string;
};

export type StaffApplicationListItem = {
  application_id: string;
  receipt_id: string;
  student_name: string;
  student_name_bn: string;
  guardian_name: string;
  applying_class: string;
  mobile: string;
  email: string;
  status: string;
  status_label: string;
  payment_method: string;
  payment_method_label: string;
  transaction_id: string;
  payment_amount: string;
  created_at: string;
  rejection_reason: string;
};

export type StaffApplicationDetail = StaffApplicationListItem & {
  date_of_birth: string;
  gender: string;
  gender_label: string;
  previous_class: string;
  student_address: string;
  student_photo: string;
  birth_certificate: string;
  guardian_nid: string;
  guardian_photo: string;
  academic_documents: string;
  father_name: string;
  mother_name: string;
  father_occupation: string;
  mother_occupation: string;
  guardian_address: string;
  emergency_contact: string;
  previous_academic_info: string;
  special_requirements: string;
  receipt_pdf_url: string;
  receipt_view_url: string;
  reviewed_at: string | null;
  reviewed_by: string;
  transaction: {
    payment_method: string;
    transaction_id: string;
    payment_amount: string;
    payment_date: string;
    payer_mobile: string;
    payment_screenshot: string;
  };
};

/** Fields staff can correct on a receipt (PATCH .../receipt/). */
export type StaffReceiptFields = {
  student_name: string;
  student_name_bn: string;
  guardian_name: string;
  applying_class: string;
  mobile: string;
  email: string;
  payment_method: string;
  transaction_id: string;
  payment_amount: string;
  payment_date: string;
  payer_mobile: string;
};
