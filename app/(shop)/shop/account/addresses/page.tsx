export default function ShopAccountAddressesPage() {
    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container" style={{ maxWidth: 900 }}>
                <div className="shop-page-card">
                    <h1 className="mb-3" style={{ fontWeight: 800 }}>عناوين الشحن</h1>
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <div className="shop-page-card h-100">
                                <h6 className="mb-2">المنزل (افتراضي)</h6>
                                <p className="text-muted mb-2">مدينة نصر، القاهرة، مصر</p>
                                <div className="d-flex gap-2">
                                    <button type="button" className="btn btn-sm btn-outline-primary">تعديل</button>
                                    <button type="button" className="btn btn-sm btn-outline-danger">حذف</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="shop-page-card h-100">
                                <h6 className="mb-2">العمل</h6>
                                <p className="text-muted mb-2">المهندسين، الجيزة، مصر</p>
                                <div className="d-flex gap-2">
                                    <button type="button" className="btn btn-sm btn-outline-primary">تعديل</button>
                                    <button type="button" className="btn btn-sm btn-outline-danger">حذف</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h5 className="mb-3">إضافة عنوان جديد</h5>
                    <form className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">اسم العنوان</label>
                            <input className="form-control" placeholder="المنزل / العمل" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">رقم الهاتف</label>
                            <input className="form-control" placeholder="01xxxxxxxxx" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">المحافظة</label>
                            <input className="form-control" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">المدينة</label>
                            <input className="form-control" />
                        </div>
                        <div className="col-12">
                            <label className="form-label">العنوان التفصيلي</label>
                            <textarea className="form-control" rows={3} />
                        </div>
                        <div className="col-12 text-end">
                            <button type="button" className="btn btn-primary">حفظ العنوان</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
