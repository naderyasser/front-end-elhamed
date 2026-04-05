export default function ReturnPolicyPage() {
    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                <div className="shop-page-card">
                    <h1 className="mb-3" style={{ fontWeight: 800 }}>
                        سياسة الاسترجاع والاستبدال
                    </h1>
                    <ul style={{ lineHeight: 2 }}>
                        <li>يمكن الاسترجاع خلال 14 يوما من تاريخ الاستلام إذا كان المنتج بحالته الأصلية.</li>
                        <li>في حالة وجود عيب مصنعي يتم استبدال المنتج دون رسوم إضافية.</li>
                        <li>تُسترد قيمة الطلب بنفس وسيلة الدفع خلال مدة تتراوح من 3 إلى 7 أيام عمل.</li>
                        <li>المنتجات المستخدمة أو المفتوحة بشكل غير سليم لا يشملها الاسترجاع.</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
