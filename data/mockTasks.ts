import { Task } from '../types';

export const mockTasks: Task[] = [
  { id: 1, title: 'مراجعة تقرير الأداء الربع سنوي', description: 'التأكد من اكتمال جميع الأقسام وتحليل البيانات.', due_date: '2024-09-15', is_completed: false },
  { id: 2, title: 'التحضير لاجتماع الإدارة الأسبوعي', description: 'تجهيز عرض تقديمي عن تقدم المشاريع الحالية.', due_date: '2024-09-10', is_completed: true },
  { id: 3, title: 'التواصل مع قسم الموارد البشرية بخصوص التعيينات الجديدة', description: 'تحديد موعد للمقابلات الشخصية للمرشحين الجدد.', is_completed: false },
  { id: 4, title: 'إرسال بريد إلكتروني للمتابعة مع الموردين', description: 'متابعة طلبات الشراء المعلقة والتأكد من تواريخ التسليم.', due_date: '2024-09-12', is_completed: false },
  { id: 5, title: 'تحديث دليل الهاتف الداخلي', description: 'إضافة الموظفين الجدد وإزالة من غادروا.', due_date: '2024-09-30', is_completed: true },
  { id: 6, title: 'تحديث برامج مكافحة الفيروسات على جميع الأجهزة', description: 'يشمل أجهزة أقسام الطوارئ والعيادات.', due_date: '2024-10-01', is_completed: false },
  { id: 7, title: 'جدولة تدريب الموظفين الجدد', description: 'التنسيق مع قسم التدريب لتحديد المواعيد والمواد.', due_date: '2024-09-25', is_completed: false },
  { id: 8, title: 'إغلاق الحسابات الشهرية لشهر سبتمبر', description: 'مراجعة جميع الفواتير والمصروفات.', due_date: '2024-10-05', is_completed: false },
  { id: 9, title: 'رفع تقرير الحضور والانصراف لشهر أغسطس', description: 'تأخر الرفع، يجب إنجازه اليوم.', due_date: '2024-09-02', is_completed: false },
  { id: 10, title: 'حجز موعد لعيادة الأسنان', description: 'متابعة شخصية.', is_completed: true },
  { id: 11, title: 'تجهيز قائمة بمتطلبات المستودع', description: 'تم إرسال القائمة لقسم المشتريات.', due_date: '2024-09-08', is_completed: true },
  { id: 12, title: 'تنظيم ورشة عمل عن الإسعافات الأولية', description: 'لجميع الموظفين الإداريين.', due_date: '2024-11-15', is_completed: false }
];
